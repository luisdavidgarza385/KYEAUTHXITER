const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const buildDir = path.join(root, 'android_build');
const sdkDir = path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk');
const buildTools = path.join(sdkDir, 'build-tools', '35.0.0');
const androidJar = path.join(sdkDir, 'platforms', 'android-34', 'android.jar');

console.log('=== Building SecureX Auth APK ===');

// Prepare directories
const resDrawable = path.join(buildDir, 'res', 'drawable');
const genDir = path.join(buildDir, 'gen');
const classesDir = path.join(buildDir, 'classes');
const dexDir = path.join(buildDir, 'dex');

[resDrawable, genDir, classesDir, dexDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Copy logo icon
fs.copyFileSync(path.join(root, 'public', 'logo.png'), path.join(resDrawable, 'ic_launcher.png'));

// 1. AAPT2 Compile
console.log('1. Compiling resources with aapt2...');
const aapt2 = path.join(buildTools, 'aapt2.exe');
const compiledRes = path.join(buildDir, 'compiled_res.zip');
execSync(`"${aapt2}" compile --dir "${path.join(buildDir, 'res')}" -o "${compiledRes}"`, { stdio: 'inherit' });

// 2. AAPT2 Link
console.log('2. Linking APK package...');
const baseApk = path.join(buildDir, 'base.apk');
execSync(`"${aapt2}" link -I "${androidJar}" --manifest "${path.join(buildDir, 'AndroidManifest.xml')}" -o "${baseApk}" --java "${genDir}" "${compiledRes}" --auto-add-overlay`, { stdio: 'inherit' });

// 3. Javac Compile
console.log('3. Compiling Java sources...');
const rJava = path.join(genDir, 'com', 'securex', 'auth', 'R.java');
const mainJava = path.join(buildDir, 'src', 'com', 'securex', 'auth', 'MainActivity.java');
execSync(`javac -source 1.8 -target 1.8 -cp "${androidJar}" -d "${classesDir}" "${rJava}" "${mainJava}"`, { stdio: 'inherit' });

// 4. D8 Dexing
console.log('4. Generating classes.dex with d8...');
const d8 = path.join(buildTools, 'd8.bat');
const classFiles = [
  path.join(classesDir, 'com', 'securex', 'auth', 'MainActivity.class'),
  path.join(classesDir, 'com', 'securex', 'auth', 'MainActivity$1.class'),
  path.join(classesDir, 'com', 'securex', 'auth', 'MainActivity$2.class'),
  path.join(classesDir, 'com', 'securex', 'auth', 'R.class'),
].filter(f => fs.existsSync(f));

execSync(`"${d8}" --lib "${androidJar}" --output "${dexDir}" "${classesDir}/com/securex/auth"/*.class`, { stdio: 'inherit' });

// 5. Add classes.dex to base.apk using jar or zip
console.log('5. Injecting classes.dex into APK...');
const classesDex = path.join(dexDir, 'classes.dex');
execSync(`jar -uf "${baseApk}" -C "${dexDir}" classes.dex`, { stdio: 'inherit' });

// 6. Sign APK with keystore
console.log('6. Signing APK with release certificate...');
const keystore = path.join(buildDir, 'release.keystore');
if (!fs.existsSync(keystore)) {
  execSync(`keytool -genkeypair -keystore "${keystore}" -alias securex -keypass 123456 -storepass 123456 -dname "CN=SecureXAuth, OU=Dev, O=SecureX, L=Dallas, ST=Texas, C=US" -validity 10000 -keyalg RSA -keysize 2048`, { stdio: 'inherit' });
}

const apksigner = path.join(buildTools, 'apksigner.bat');
const outApkNueva = path.join(root, 'Nueva carpeta', 'SecureX-Auth.apk');
const outApkPublic = path.join(root, 'public', 'SecureX-Auth.apk');

execSync(`"${apksigner}" sign --ks "${keystore}" --ks-pass pass:123456 --key-pass pass:123456 --out "${outApkNueva}" "${baseApk}"`, { stdio: 'inherit' });

fs.copyFileSync(outApkNueva, outApkPublic);

console.log('✅ SUCCESS! SecureX-Auth.apk has been generated:');
console.log('  -> ' + outApkNueva);
console.log('  -> ' + outApkPublic);
