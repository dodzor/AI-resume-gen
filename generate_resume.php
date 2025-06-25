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

$prompt = <<<EOD
Generate a professional resume for the following person based on the target job description: $job

Name: $name
Email: $email

Work Experience:
$experience

Skills:
$skills

Format it in clean HTML with clear sections and professional styling.
EOD;

$data = [
    "model" => "gpt-4o",
    // "model" => "gpt-3.5-turbo",
    "messages" => [
        ["role" => "system", "content" => "You are a professional resume writer. Create a well-formatted, professional resume based on the provided information. Use HTML formatting with proper structure and styling."],
        ["role" => "user", "content" => $prompt]
    ],
    "temperature" => 1,
    "max_tokens" => 1500
];

// Debug: Log what we're sending
error_log("Sending to API: " . json_encode($data, JSON_PRETTY_PRINT));

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
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Debug: Log the raw response
error_log("HTTP Code: " . $http_code);
error_log("Raw API Response: " . $response);

$result = json_decode($response, true);

// Check for errors
if ($http_code !== 200) {
    echo "<div style='color: red; padding: 20px; border: 1px solid red;'>";
    echo "<h3>API Error (HTTP $http_code)</h3>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
    echo "</div>";
    exit;
}

if (isset($result['error'])) {
    echo "<div style='color: red; padding: 20px; border: 1px solid red;'>";
    echo "<h3>OpenAI API Error</h3>";
    echo "<p><strong>Type:</strong> " . htmlspecialchars($result['error']['type']) . "</p>";
    echo "<p><strong>Message:</strong> " . htmlspecialchars($result['error']['message']) . "</p>";
    echo "</div>";
    exit;
}

if (!isset($result['choices'][0]['message']['content'])) {
    echo "<div style='color: red; padding: 20px; border: 1px solid red;'>";
    echo "<h3>Unexpected API Response</h3>";
    echo "<pre>" . htmlspecialchars(json_encode($result, JSON_PRETTY_PRINT)) . "</pre>";
    echo "</div>";
    exit;
}

echo $result['choices'][0]['message']['content'];



