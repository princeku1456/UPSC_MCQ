import json
import re

def extract_flat_questions(input_file, output_file):
    try:
        # Load the JS file content
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract only the JSON-like object between the first { and last }
        # This removes the JS variable declaration and the module.exports line
        match = re.search(r'(\{.*\})', content, re.DOTALL)
        if not match:
            print("No valid data structure found in file.")
            return

        # Parse the extracted string as a dictionary
        data = json.loads(match.group(1))

        # Create a single list containing only the question objects
        all_questions = []
        for question_list in data.values():
            all_questions.extend(question_list)

        # Save the result to a single JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_questions, f, indent=4, ensure_ascii=False)

        print(f"Extraction successful! Total questions: {len(all_questions)}")
        print(f"Data saved to: {output_file}")

    except Exception as e:
        print(f"Error: {e}")

# Execution
extract_flat_questions('worldGeographyData.js', 'flat_geo_questions.json')
extract_flat_questions('indianGeographyData.js', 'flat_geoi_questions.json')
extract_flat_questions('irData.js', 'flat_ir_questions.json')
extract_flat_questions('environmentData.js', 'flat_environment_questions.json')
extract_flat_questions('economyData.js', 'flat_eco_questions.json')
extract_flat_questions('scienceTechData.js', 'flat_sci_questions.json')