# Fine-Tuning and Integrating Multimodal AI for a Romanian University Assistant

This repository contains resources related to the paper [*Fine-Tuning and Integrating Multimodal AI for a Romanian University Assistant*](TODO: ADD LINK HERE). It includes links to the fine-tuned models, datasets, and the code for both the LLM fine-tuning/testing and the full chatbot mobile application.

## Models and Datasets

The fine-tuned models and datasets used in this project are available on Hugging Face:

* **Hugging Face Profile:** [https://huggingface.co/Andrei481](https://huggingface.co/Andrei481)
* **Models include:**
    * `Andrei481/Llama-2-13b-chat-open-instruct-v1-ro`
    * `Andrei481/llama-3-8b-unsloth-corpus-open-instruct-ro-16b`
    * `Andrei481/llama-3-8b-instruct-unsloth-open-instruct-ro-16b`
    * `Andrei481/Mistral-7B-Instruct-v0.2-open-instruct-ro`


## Usage Instructions

### 1. Testing the Fine-tuned Romanian LLMs

You can test the inference capabilities of the fine-tuned LLMs using a tool like `oobabooga/text-generation-webui`.

1.  **Install `text-generation-webui`:** Follow the official installation instructions: [https://github.com/oobabooga/text-generation-webui?tab=readme-ov-file#how-to-install](https://github.com/oobabooga/text-generation-webui?tab=readme-ov-file#how-to-install)
2.  **Download a Model:** Within the `text-generation-webui` interface, navigate to the model downloader and download one of the models listed above from the `Andrei481` Hugging Face account.
3.  **Load and Test:** Load the downloaded model and interact with it. For optimal results, use the specific prompt format detailed on the model's Hugging Face page.

### 2. Running the Full Romanian Chatbot Mobile Application

**Note:** These instructions assume a specific setup involving a Google Cloud VM instance for the backend, another machine (or VM) with multiple GPUs for the LLM inference, and potentially access to the UPT network. Adjustments may be needed for different environments.

**Prerequisites:**

* Access to the Google Cloud VM instance hosting the backend.
* Access to a machine with at least 3 GPUs (Instructions use GPU 0, 1, and 2).
* Conda environment named `mobile-app` set up on the LLM machine.
* OpenVPN configured for connecting to the UPT network (if required for backend access).

**Steps:**

1.  **Start the Backend Server:**
    * Connect to the Google Cloud VM instance via SSH.
    * Navigate to the application's backend directory.
    * Run the startup script:
        ```bash
        ./start_server.sh
        ```

2.  **Prepare LLM Machine (Terminal 1 - GPUs 0, 1):**
    * Open a terminal on the LLM machine.
    * Restrict visibility to the first two GPUs:
        ```bash
        export CUDA_VISIBLE_DEVICES=0,1
        ```
    * Activate the Conda environment:
        ```bash
        conda activate mobile-app
        ```

3.  **Start vLLM Inference Server (Terminal 1):**
    * Start the vLLM server using the recommended model (`llama-3-8b-instruct-unsloth-open-instruct-ro-16b`), distributing it across the two visible GPUs (tensor parallel size = 2) and exposing it on port 8001:
        ```bash
        python -m vllm.entrypoints.api_server --model Andrei481/llama-3-8b-instruct-unsloth-open-instruct-ro-16b --tensor-parallel-size=2 --port 8001
        ```

4.  **Prepare LLM Machine (Terminal 2 - GPU 2):**
    * Open a *second* terminal on the LLM machine.
    * Restrict visibility to the third GPU:
        ```bash
        export CUDA_VISIBLE_DEVICES=2
        ```
    * Activate the Conda environment:
        ```bash
        conda activate mobile-app
        ```

5.  **Start FastAPI Server (Terminal 2):**
    * Start the FastAPI server (which likely handles RAG, STT/TTS, and interfaces with vLLM) on port 8000:
        ```bash
        uvicorn main:app --host 0.0.0.0 --port 8000
        ```

6.  **Install the Mobile App:**
    * Download and install the latest `.apk` release from the mobile application repository's releases page: [https://github.com/Andrei481/RomanianChatbot/releases](https://github.com/Andrei481/RomanianChatbot/releases)

7.  **Network Connection (If Required):**
    * Connect your mobile device to the UPT network, potentially using OpenVPN, if the backend server is only accessible within this network.

8.  **Launch and Use:**
    * Open the installed RomanianChatbot application on your mobile device and start interacting.
