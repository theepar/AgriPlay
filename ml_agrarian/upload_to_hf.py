from huggingface_hub import HfApi, login
import os

# Login dengan token
login(token=os.getenv("HF_TOKEN"))

# Initialize API
api = HfApi()

# Upload folder ke Space
print("Uploading files to Hugging Face Space...")
api.upload_folder(
    folder_path="./agrarian-ml-api",
    repo_id="theparr/agrarian-ml-api",
    repo_type="space",
    commit_message="Deploy Agrarian ML API"
)

print("✅ Deployment successful!")
print("Space URL: https://huggingface.co/spaces/theparr/agrarian-ml-api")
