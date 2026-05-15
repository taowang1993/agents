---
name: react-native
description: React Native with testID and accessibilityLabel, component patterns, Expo
metadata:
  tags: react-native, testID, accessibilityLabel, expo
---

## Element Identification

React Native uses two main approaches:

### testID (Recommended)

```jsx
<TouchableOpacity testID="login_button" onPress={handleLogin}>
  <Text>Login</Text>
</TouchableOpacity>
```

In Maestro:

```yaml
- tapOn:
    id: "login_button"
```

### accessibilityLabel

```jsx
<Text accessibilityLabel="welcome_message">Welcome to the app</Text>
```

In Maestro:

```yaml
- assertVisible:
    id: "welcome_message"
```

## Common Components

### Text Input

```jsx
<TextInput
  testID="email_input"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
/>
```

### Buttons (Pressable)

```jsx
<Pressable testID="submit_button" onPress={onSubmit}>
  <Text>Submit</Text>
</Pressable>
```

### ScrollView

```jsx
<ScrollView testID="main_scroll">{/* content */}</ScrollView>
```

### FlatList Items

```jsx
<FlatList
  testID="items_list"
  data={items}
  renderItem={({ item, index }) => (
    <View testID={`item_${index}`}>
      <Text>{item.name}</Text>
    </View>
  )}
/>
```

## Detecting Maestro in React Native

Use the `react-native-launch-arguments` package:

```javascript
import { LaunchArguments } from 'react-native-launch-arguments';

if (LaunchArguments.value().isMaestro === "true") {
    // Test mode: disable analytics, use mock data
}
```

Pass the argument from your flow:

```yaml
- launchApp:
    arguments:
      isMaestro: "true"
```

## Naming Convention

Use snake_case: `{screen}_{element}_{type}`

```jsx
testID = "login_email_input";
testID = "login_password_input";
testID = "login_submit_button";
testID = "home_profile_card";
```

## Expo Projects

Expo works identically:

```jsx
import { Pressable, Text } from "react-native";

export default function App() {
  return (
    <Pressable testID="hello_button">
      <Text>Hello</Text>
    </Pressable>
  );
}
```

## Full Example

**React Native:**
```jsx
export const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <TextInput
        testID="login_email_input"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        testID="login_password_input"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Pressable
        testID="login_submit_button"
        onPress={() => onLogin(email, password)}
        style={styles.button}
      >
        <Text>Login</Text>
      </Pressable>
    </View>
  );
};
```

**Maestro:**
```yaml
appId: com.example.myreactnativeapp
---
- launchApp:
    clearState: true
- tapOn:
    id: "login_email_input"
- inputText: "test@example.com"
- tapOn:
    id: "login_password_input"
- inputText: "password123"
- hideKeyboard
- tapOn:
    id: "login_submit_button"
- assertVisible: "Dashboard"
```

## Troubleshooting

### testID Not Found

1. Verify element is rendered on screen (`maestro hierarchy`)
2. Ensure testID is on the correct component (not a wrapper View)
3. Check for conditional rendering that may hide it

### Platform-Specific testID

```jsx
<View
  testID={Platform.select({
    ios: 'profile_card_ios',
    android: 'profile_card_android',
  })}
>
```
