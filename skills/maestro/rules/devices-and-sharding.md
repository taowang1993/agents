---
name: devices-and-sharding
description: Start devices, target specific devices, list local/cloud devices, and shard local runs
metadata:
  tags: devices, sharding, start-device, list-devices, cloud-devices, udid
---

## Start a local device

Maestro can create and launch supported simulators / emulators directly.

### Show available options

```bash
maestro start-device
```

### Start Android

```bash
maestro start-device --platform android
maestro start-device --platform android --device-model pixel_7 --device-os android-34
```

### Start iOS

```bash
maestro start-device --platform ios
maestro start-device --platform ios --device-model iPhone-17-Pro --device-os iOS-18-2
```

## List supported devices

### Local device models / OS versions

```bash
maestro list-devices
maestro list-devices --platform ios
```

### Maestro Cloud device models / OS versions

```bash
maestro list-cloud-devices
maestro list-cloud-devices --platform android
```

## Target a specific device

When multiple devices are running, pass the device identifier before the subcommand:

```bash
maestro --device 5B6D77EF-2AE9-47D0-9A62-70A1ABBC5FA2 test flow.yaml
```

Useful ways to discover IDs:

```bash
# Android
adb devices

# iOS
xcrun simctl list devices booted
```

## Local sharding

Sharding is for local or self-managed CI runners with multiple already-booted devices.

### Run the same suite on all shards

Use `--shard-all` when every device should run the same test collection:

```bash
maestro test --shard-all 3 .maestro
```

### Split the suite across shards

Use `--shard-split` when Maestro should divide the suite across devices:

```bash
maestro test --shard-split 3 .maestro
```

### Restrict sharding to specific devices

```bash
maestro test --device "emulator-5554,emulator-5556" --shard-split 2 ./myTests
```

## Important sharding rules

- `--shard-all` and `--shard-split` expect the required number of devices to already be booted
- If you request 3 shards but only 2 devices are connected, Maestro errors
- Maestro Cloud handles device allocation and parallelism for Cloud runs, so local sharding flags are mainly for local runners

## Screenshot naming while sharding

When multiple shards write to the same workspace, duplicate screenshot names can overwrite each other. Use built-in variables to keep names unique:

```yaml
- takeScreenshot: "LoginScreen-shard_${MAESTRO_SHARD_INDEX}-device_${MAESTRO_DEVICE_UDID}.png"
```

## Built-in sharding variables

| Variable | Meaning |
|---|---|
| `MAESTRO_FILENAME` | Current Flow filename |
| `MAESTRO_DEVICE_UDID` | Device identifier |
| `MAESTRO_SHARD_ID` | 1-based shard number |
| `MAESTRO_SHARD_INDEX` | 0-based shard number |

## Related guidance

- Use `rules/reporting-and-analysis.md` for artifacts and output directories
- Use `rules/ci-integration.md` for CI-friendly execution patterns
- Use `rules/platforms/android.md` and `rules/platforms/ios.md` for platform-specific setup/debugging
