import speech_recognition as sr


def main():
    r = sr.Recognizer() # Speech to Text

    with sr.Microphone() as source: # Mic Access
        r.adjust_for_ambient_noise(source) #cut off background noise
        r.pause_threshold = 2 #wait for 2 seconds for silence

        
       

        print("Speak Something...")
        audio = r.listen(source)

        print("Processing Audio... (STT)")            
        stt = r.recognize_google(audio)
        print("You Said:", stt)

           

main()