<?php

function get_post($key) {
    return htmlspecialchars($_POST[$key] ?? '');
}

$api_key = parse_ini_file('.env');
// echo "API Key: " . $api_key['OPENAI_API_KEY'];

$name = get_post('name');
$email = get_post('email');
$experience = get_post('experience');
$skills = get_post('skills');
$job = get_post('job');

$prompt = <<<PROMPT
Generate a professional resume for the following person:

Name: $name
Email: $email

Work Experience:
$experience

Skills:
$skills

Target Job Description:
$job

Format it in clean text/HTML with clear sections.
PROMPT;

$data = [
    "model" => "gpt-4o",  // Correct, public API-supported model
    "messages" => [
        ["role" => "system", "content" => "You are a helpful assistant that formats professional resumes."],
        ["role" => "user", "content" => $prompt]
    ],
    "temperature" => 0.7
];

$curl = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer " . $api_key['OPENAI_API_KEY']
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($curl);
curl_close($curl);

$result = json_decode($response, true);
var_dump($result);

// echo $result['choices'][0]['message']['content'];



