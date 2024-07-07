# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container to /app
WORKDIR /

# Add the current directory contents into the container at /app
ADD . /

# Install any needed packages specified in requirements.txt
RUN pip install -r app/requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run app.py when the container launches
CMD ["python", "app/main.py"]
