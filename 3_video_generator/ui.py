import gradio as gr

from veo_vid import generate_video

with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown("# Veo Video Generator\nEnter your prompt and generate a video!")
    prompt = gr.Textbox(
        label="Prompt",
        value="A high-end fashion ad showing a confident male model in a new dark blue suit sprinting down a professional runway.",
    )
    generate_btn = gr.Button("Generate Video")
    video_output = gr.Video(label="Generated Video")

    def on_generate(prompt):
        video_path = generate_video(prompt)
        if video_path:
            return gr.update(value=video_path)
        else:
            return gr.update(value=None)

    generate_btn.click(on_generate, inputs=prompt, outputs=video_output)

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0", server_port=7860, auth=("devmode", "testdeployment8721")
    )