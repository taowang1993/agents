---
name: javascript
description: evalScript, runScript, HTTP requests (GET/POST/PUT/DELETE/PATCH), multipart, json(), output object
metadata:
  tags: javascript, evalScript, runScript, graaljs, http, api
---

## JavaScript in Maestro

Maestro supports JavaScript for custom logic, HTTP requests, data manipulation, and API interactions.

## Inline Script (evalScript)

```yaml
- evalScript: ${output.value = 'Hello World'}
- inputText: ${output.value}
```

Multi-line:

```yaml
- evalScript: |
    const timestamp = new Date().getTime();
    output.uniqueId = 'user_' + timestamp;
- inputText: ${output.uniqueId}
```

## External Script (runScript)

```yaml
- runScript:
    file: scripts/generate_data.js
```

### Script File

```javascript
// scripts/generate_data.js
const randomEmail = "user_" + Math.floor(Math.random() * 10000) + "@test.com";
output.email = randomEmail;
output.timestamp = new Date().toISOString();
```

### Use Output

```yaml
- runScript:
    file: scripts/generate_data.js
- inputText: ${output.email}
```

## HTTP Requests

Maestro includes a built-in HTTP client (okhttp3 wrapper).

### GET

```javascript
const response = http.get('https://api.example.com/user/1');
const userData = json(response.body);
output.username = userData.profile.name;
```

### POST

```javascript
const response = http.post('https://api.example.com/login', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: "test@example.com",
        password: "secret"
    })
});
output.token = json(response.body).token;
```

### PUT / DELETE

```javascript
const response = http.put('https://api.example.com/user/1', {
    body: JSON.stringify({ name: "Updated Name" })
});

const response = http.delete('https://api.example.com/user/1');
```

### PATCH / Other Methods

```javascript
const response = http.request('https://api.example.com/order/1', {
    method: "PATCH",
    body: JSON.stringify({ status: "shipped" })
});
```

### Multipart Form Data (File Upload)

```javascript
const response = http.post('https://example.com/upload', {
    multipartForm: {
        "uploadType": "import",
        "data": {
            "filePath": "/path/to/file.csv",
            "mediaType": "text/csv"       // MIME type (optional)
        }
    }
});
```

Note: If both `body` and `multipartForm` are provided, `body` is ignored.

### The Response Object

| Field | Type | Description |
|---|---|---|
| `ok` | Boolean | `true` for 2xx status |
| `status` | Number | HTTP status code |
| `body` | String | Raw response body |
| `headers` | Object | Response headers (comma-separated for multiples) |

### JSON Parsing

Use the global `json()` function:

```javascript
const response = http.get('https://api.example.com/products');
const products = json(response.body);    // Parse JSON string to object
output.count = products.length;
output.firstName = products[0].name;
```

## Debugging JavaScript

Use `console.log()` to print values during script execution:

```yaml
- evalScript: |
    console.log('Current timestamp:', Date.now());
    console.log('User:', USERNAME);
```

Output appears in device logs and when running with `--verbose`.

## The `output` Object

Any property set on `output` is available in subsequent steps:

```yaml
- evalScript: ${output.name = 'John'}
- assertVisible: "Hello, ${output.name}"
```

## Variable Access

Flow parameters are available as global variables in scripts:

```yaml
env:
  API_URL: https://api.example.com
  USERNAME: test@example.com
---
- runScript:
    file: scripts/api_call.js
```

```javascript
// scripts/api_call.js — API_URL and USERNAME are globals
const response = http.get(API_URL + '/users/' + USERNAME);
output.userData = json(response.body);
```

## Synthetic Data with `faker`

Maestro provides a built-in `faker` object (DataFaker integration) for generating randomized test data:

```yaml
# Inline usage directly in commands
- inputText:
    text: ${faker.name().firstName()}
- inputText:
    text: ${faker.internet().emailAddress()}

# Store in output for later use
- evalScript: ${output.email = faker.internet().emailAddress()}
- inputText: ${output.email}

# Complex expressions
- evalScript: ${output.bio = faker.expression("#{name.fullName} lives in #{address.city}")}
```

Common providers:
- `faker.name().firstName()`, `faker.name().fullName()`
- `faker.internet().emailAddress()`
- `faker.number().digits(5)`, `faker.expression("#{number.numberBetween '1' '10'}")`
- `faker.finance().creditCard()`
- `faker.lordOfTheRings().character()`, `faker.lordOfTheRings().location()`

See [DataFaker docs](https://www.datafaker.net/documentation/providers/) for all available providers.

## Runtime Options

### GraalJS (Default)

The GraalJS engine is enabled by default, providing modern ECMAScript (ES6+) support.

### Rhino (Deprecated)

Rhino is the legacy JavaScript runtime. Maestro discourages its use. If you need to force Rhino (not recommended), it must be explicitly enabled.

## Supported Features

| Feature | Supported |
|---|---|
| String manipulation | ✅ |
| Math operations | ✅ |
| Date/Time | ✅ |
| JSON parse/stringify | ✅ |
| HTTP requests (GET/POST/PUT/DELETE/PATCH) | ✅ |
| Multipart file upload | ✅ |
| Arrays/Objects | ✅ |
| require/import | ❌ |
| File system access | ❌ |
| External npm packages | ❌ |

## Common Patterns

### Generate Random Data

```javascript
output.randomNumber = Math.floor(Math.random() * 1000);
output.randomString = Math.random().toString(36).substring(7);
output.uniqueEmail = 'user_' + Date.now() + '@test.com';
```

### API Validation (Setup via API, verify via UI)

```yaml
# flow.yaml
---
- launchApp
- runScript: scripts/create_appointment.js
- tapOn: "My Appointments"
- assertVisible: ${output.appointmentTitle}
```

```javascript
// scripts/create_appointment.js
const response = http.post('https://my-api.com/v1/appointments', {
    body: JSON.stringify({ title: "Health Check", date: "2026-02-10" }),
    headers: { 'Content-Type': 'application/json' }
});
const data = json(response.body);
output.appointmentTitle = data.title;
```

### Counter / State

```yaml
- evalScript: ${output.attempt = 0}
- repeat:
    while:
      true: ${output.attempt < 3}
    commands:
      - tapOn: "Refresh"
      - evalScript: ${output.attempt++}
```

### Date Manipulation

```javascript
const now = new Date();
output.today = now.toISOString().split("T")[0];
output.timestamp = now.getTime();
output.nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];
```
