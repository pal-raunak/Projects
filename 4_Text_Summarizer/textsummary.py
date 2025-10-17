# https://huggingface.co/spaces/palrono/TextSummarizer

import torch 
import gradio as gr
# Use a pipeline as a high-level helper
from transformers import pipeline

model_path = ("../Models/models--sshleifer--distilbart-cnn-12-6/snapshots/a4f8f3ea906ed274767e9906dbaede7531d660ff")
text_summary = pipe = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", dtype=torch.bfloat16) #dtype = compress the model without degrading it.

# text='''Elon Reeve Musk (/ˈiːlɒn/ EE-lon; born June 28, 1971) is a businessman and investor.
# He is the founder, chairman, CEO, and CTO of SpaceX; angel investor, CEO, product architect,
# and former chairman of Tesla, Inc.; owner, executive chairman, and CTO of X Corp.;
# founder of the Boring Company and xAI; co-founder of Neuralink and OpenAI; and president
# of the Musk Foundation. He is one of the wealthiest people in the world; as of April 2024,
# Forbes estimates his net worth to be $178 billion.[4]'''

# print(text_summary(text))

def summary(input):
    response = text_summary(input)
    return response[0]['summary_text']

gr.close_all()

# demo = gr.Interface(fn=summary, inputs="text", outputs="text")
demo = gr.Interface(fn=summary,
                    inputs=[gr.Textbox(label="Input text to summarize",lines=6)],
                    outputs=[gr.Textbox(label="Summarized text",lines=4)],
                    title="TEXT SUMMARIZER",
                    description="This Application will be used to Summarize the Text")

demo.launch()
