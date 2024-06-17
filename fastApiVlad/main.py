from fastapi import FastAPI, HTTPException, Body, Request
from pydantic import BaseModel
from langchain.document_loaders import HuggingFaceDatasetLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain import HuggingFacePipeline
import textwrap
import re
import logging
import requests

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

# Define the generate_with_vllm function
def generate_with_vllm(prompt, max_length=1024, temperature=0.95, **kwargs):
    url = "http://localhost:8001/generate"
    payload = {
        "prompt": prompt,
        "max_tokens": max_length,
        "temperature": temperature,
        "n": 1
    }
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return str(response.json()["text"])

# Create CustomPipeline
class CustomPipeline:
    def __init__(self, generator_fn):
        self.generator_fn = generator_fn
        self.task = "text-generation"

    def __call__(self, inputs, **kwargs):
        prompt = inputs[0] if isinstance(inputs, list) else inputs
        generated_text = self.generator_fn(prompt, **kwargs)
        return [{"generated_text": generated_text}]

custom_pipeline = CustomPipeline(generate_with_vllm)

# Initialize HuggingFacePipeline
llm = HuggingFacePipeline(pipeline=custom_pipeline, model_kwargs={"temperature": 0.95, "max_length": 1024})

# Load dataset and create retriever
dataset_name = "dianaCerni/DatasetRagUPT"
page_content_column = "chunk"

loader = HuggingFaceDatasetLoader(dataset_name, page_content_column)
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
docs = text_splitter.split_documents(data)

model_path = "BlackKakapo/stsb-xlm-r-multilingual-ro"
embeddings = HuggingFaceEmbeddings(model_name=model_path)

db = FAISS.from_documents(docs, embeddings)
retriever = db.as_retriever(search_kwargs={"k": 10})

# Define the prompt template
llama3_prompt = """<|begin_of_text|><|start_header_id|>system<|end_header_id|>Sunteți un asistent util al cărui scop este sa ajute studenții de la Universitatea Politehnica Timișoara. Dacă o întrebare nu are niciun sens sau nu este corectă din punct de vedere factual, explicați de ce în loc să răspundeți la ceva incorect. Dacă nu știți răspunsul la o întrebare, vă rugăm să nu împărtășiți informații false. Oferă răspunsuri bazate doar pe informațiile primite în context. Dacă în context apar cuvinte în limba engleză, răspunsul le va cuprinde în limba engleză.
    {context}<|eot_id|><|start_header_id|>user<|end_header_id|>
    {question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

prompt_template = PromptTemplate(
    input_variables=["context", "question"],
    template=llama3_prompt
)

# Create the RetrievalQA chain
chain_type_kwargs_me = {"prompt": prompt_template}

qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    chain_type_kwargs=chain_type_kwargs_me,
    return_source_documents=True
)

def wrap_text_preserve_newlines(text, width=110):
    lines = text.split('\n')

    wrapped_lines = [textwrap.fill(line, width=width) for line in lines]

    wrapped_text = '\n'.join(wrapped_lines)

    return wrapped_text

def process_llm_response(llm_response):
    # Extract the generated text
    generated_text = llm_response['result']

    # Define the identifier
    identifier = "|>assistant<|end_header_id|>"

    # Find the position of the identifier in the generated text
    position = generated_text.find(identifier)

    # If the identifier is found, get the text after it
    if position != -1:
        relevant_text = generated_text[position + len(identifier):].strip()
    else:
        relevant_text = generated_text

    wrapped_text = wrap_text_preserve_newlines(relevant_text)
    return {"response": wrapped_text}

class PromptRequest(BaseModel):
    prompt: str

@app.post('/rag')
async def rag_endpoint(request: PromptRequest, raw_request: Request):
    logging.debug(f"Headers: {raw_request.headers}")
    logging.debug(f"Body: {await raw_request.body()}")
    prompt = request.prompt
    logging.debug(f"Received prompt: {prompt}")  # Debugging: Print the received prompt
    result = qa(prompt)
    processed_response = result["result"]
    # processed_response_str = ''.join(str(e) for e in processed_response)
    pattern = r">assistant<\|end_header_id\|>\s*(.*?)]"
    match = re.search(pattern, processed_response, re.DOTALL)
    extracted_text = match.group(1).strip() if match else None
    print(f"EXTRACTED TEXT: {extracted_text}")
    print(f"processed_response: {type(processed_response)}")

    cleaned_text = extracted_text.replace('\\n\\n', "").strip().rstrip("'")

    return cleaned_text

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)