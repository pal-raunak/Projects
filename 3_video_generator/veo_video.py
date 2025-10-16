import os
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()


def generate_video(prompt):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    operation = client.models.generate_videos(
        model="veo-3.1-generate-preview",
        prompt=prompt,
        config={
            "aspect_ratio": "16:9",
            "negative_prompt": "cartoon, drawing, low quality",
        },
    )

    # Poll the operation status until the video is ready.
    while not operation.done:
        print("Waiting for video generation to complete...")
        time.sleep(10)
        operation = client.operations.get(operation)

    # Download the generated video.
    generated_video = operation.response.generated_videos[0]
    client.files.download(file=generated_video.video)
    generated_video.video.save("example.mp4")
    print("Generated video saved to example.mp4")
    return "example.mp4"  # Return the path of the generated video


if __name__ == "__main__":

    prompt = (
        "A high-end fashion ad showing a confident male model in a new dark blue suit "
        "sprinting down a professional runway. The model begins at the ramp's edge, "
        "straightening his jacket and giving a close-up, focused look. He runs "
        "forward, energetically engaging with the camera, then transitions to smooth "
        "side and three-quarter views. The video uses fast, smooth cinematic cuts, "
        "dynamic tracking, and stylish lateral pans. The model does a slow-motion "
        "turn, strikes a confident pose with hands in pockets, and the camera "
        "elegantly pans from shoes to face. Dramatic runway lighting, crisp highlights, "
        "and an upbeat, trendy soundtrack add excitement. In the final second, the "
        "model stops, looks directly into the camera with a smile, and the scene "
        "blurs to a bold, minimalist animated brand title card: 'Best Name.' The "
        "whole scene is energetic, clean, visually striking, and lasts 8 seconds, "
        "echoing top luxury fashion campaigns."
    )
    generate_video(prompt)