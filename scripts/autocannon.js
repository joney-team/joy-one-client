const autocannon = require('autocannon')

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjcwMTc3NTgxNDQ4ZjZlZDg3ZDYzODUiLCJhdXRoVmVyc2lvbiI6MCwiaWF0IjoxNzQ2Nzk3Mjg3LCJleHAiOjE3NDY4ODM2ODd9.sfx6jIM9WzmO-kl5s8hn1ELtQIRCSAi1t6Ko3UYItMA'

const headers = {
  'Authorization': 'Bearer ' + token,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  'X-Device-Id': '681cae863d8670c3eedb7a3b',
  'X-Session-Id': '9a3f63f2-1326-4bb1-b5ab-c96760da1a1d',
  'X-Workspace-Id': '6678e77d0cec140c3f7c69e0',
  'content-type': 'application/json',
}

async function runBenchmark() {
  await autocannon({
    url: 'http://localhost:4000/reports/period',
    method: 'POST',
    headers,
    body: JSON.stringify({
      "fromTime": 1746032400,
      "toTime": 1746798957,
      "period": "date"
    }),

    connections: 100,
    duration: 10,
    pipelining: 10,
  })
}

runBenchmark();