BASE_URL="http://localhost:8000"

send_post_request() {
  local endpoint=$1
  local json_data=$2

  curl -X POST "${BASE_URL}${endpoint}" \
       -H "Content-Type: application/json" \
       -d "${json_data}"
  
  if [ $? -ne 0 ]; then
    echo "\nError: Failed to send POST request to ${endpoint}"
    exit 1
  else
    echo "\nSuccessfully sent POST request to ${endpoint}"
  fi
}

send_post_request "/add" '{
  "payer": "DANNON",
  "points": 300,
  "timestamp": "2022-10-31T10:00:00Z"
}'

send_post_request "/add" '{
  "payer": "UNILEVER",
  "points": 200,
  "timestamp": "2022-10-31T11:00:00Z"
}'

send_post_request "/add" '{
  "payer": "DANNON",
  "points": -200,
  "timestamp": "2022-10-31T15:00:00Z"
}'
send_post_request "/add" '{
  "payer": "MILLER COORS",
  "points": 10000,
  "timestamp": "2022-11-01T14:00:00Z"
}'

send_post_request "/add" '{
  "payer": "DANNON",
  "points": 1000,
  "timestamp": "2022-11-02T14:00:00Z"
}'
send_post_request "/spend" '{
  "points": 5000
}'

curl -X GET "${BASE_URL}/balance"

echo "\nAll requests have been sent successfully."
