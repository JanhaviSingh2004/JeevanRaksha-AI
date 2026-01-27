from googletrans import Translator

translator = Translator()

text = "Patient has mild fever and cough for 3 days."

summary_hindi = translator.translate(text, dest='hi').text
summary_punjabi = translator.translate(text, dest='pa').text

print("Hindi:", summary_hindi)
print("Punjabi:", summary_punjabi)
