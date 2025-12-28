FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY ./saved_models ./saved_models
COPY ./app ./app

# Expose port
EXPOSE 7860

# Run the application on port 7860 (Hugging Face Spaces default)
CMD ["uvicorn", "app.main_alt:app", "--host", "0.0.0.0", "--port", "7860"]
