import sys
import os
from TTS.api import TTS

def main():
    if len(sys.argv) != 4:
        print("Usage: python generate_tts_audio.py <text> <output_path> <language_code>")
        print("Example: python generate_tts_audio.py 'Hello World' 'output.wav' 'en'")
        sys.exit(1)

    text = sys.argv[1]
    output_path = sys.argv[2]
    language_code = sys.argv[3].lower()

    # Validate language code (optional, but good practice)
    supported_languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar', 'zh-cn', 'ja', 'ko', 'hi'] # Add more if needed
    if language_code not in supported_languages:
        print(f"Warning: Language code '{language_code}' might not be supported by the model. Supported: {supported_languages}")

    try:
        print(f"Loading Coqui TTS model 'tts_models/multilingual/multi-dataset/xtts_v2'...")

        # Initialize TTS
        tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=False, gpu=False) # Set gpu=True if you have a compatible GPU

        # Attempt to print available languages (handle potential AttributeError)
        try:
            print(f"Available languages: {tts.languages}")
        except AttributeError:
            print("Info: The 'languages' attribute is not available in this version of TTS API.")
            # We rely on the user-provided language code or the list above

        # Access the synthesizer object which holds the speaker manager
        synthesizer = tts.synthesizer

        # Access the speaker manager
        speaker_manager = synthesizer.tts_model.speaker_manager

        # Get the dictionary of available speakers
        available_speakers_dict = speaker_manager.speakers

        # Print the keys of the dictionary (these are the speaker IDs)
        print(f"Available speaker IDs: {list(available_speakers_dict.keys())}")

        # Choose a speaker ID from the list printed above.
        # Common defaults might be something like 'paimon', 'female', 'male', or UUIDs.
        # Let's assume the first one in the list is a good candidate.
        # Replace this line with the specific ID you find works best.
        available_speaker_ids = list(available_speakers_dict.keys())
        if not available_speaker_ids:
             print("Error: No speakers found in the loaded model.", file=sys.stderr)
             sys.exit(1)

        # Use the first available speaker ID as the default
        default_speaker = 'Henriette Usha' # Use the first speaker ID found

        print(f"Model loaded. Generating audio for text: '{text[:50]}...' in language '{language_code}' using speaker '{default_speaker}'")

        # Synthesize speech and save to file
        # IMPORTANT: xtts_v2 requires both 'speaker' and 'language' parameters
        tts.tts_to_file(
            text=text,
            speaker=default_speaker, # Use the speaker ID found from the model
            language=language_code,
            file_path=output_path
        )

        # Check if the file was created and has content
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            print(f"Coqui TTS: Generated audio file successfully: {output_path}")
        else:
            print(f"Coqui TTS: Generated audio file is empty or missing: {output_path}", file=sys.stderr)
            sys.exit(1)

    except Exception as e:
        print(f"Coqui TTS Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc() # Print the full stack trace for debugging
        sys.exit(1)

if __name__ == "__main__":
    main()