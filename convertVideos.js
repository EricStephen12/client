const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Locate ffmpeg-static binary
const ffmpegPath = path.resolve(__dirname, '../server/node_modules/ffmpeg-static/ffmpeg.exe');

if (!fs.existsSync(ffmpegPath)) {
  console.error('❌ CRITICAL: ffmpeg.exe not found at:', ffmpegPath);
  process.exit(1);
}

console.log('✅ Found ffmpeg binary at:', ffmpegPath);

const publicDir = path.join(__dirname, 'public');
const videosDir = path.join(publicDir, 'videos');

// Gather all mp4 files to convert
const tasks = [];

// 1. Hero Video
const heroMp4 = path.join(publicDir, 'hero-video.mp4');
if (fs.existsSync(heroMp4)) {
  tasks.push({
    input: heroMp4,
    output: path.join(publicDir, 'hero-video.webm'),
    name: 'hero-video.mp4'
  });
}

// 2. Background Videos (v1.mp4 - v8.mp4)
if (fs.existsSync(videosDir)) {
  const files = fs.readdirSync(videosDir);
  files.forEach(file => {
    if (file.endsWith('.mp4')) {
      tasks.push({
        input: path.join(videosDir, file),
        output: path.join(videosDir, file.replace('.mp4', '.webm')),
        name: `videos/${file}`
      });
    }
  });
}

console.log(`🚀 Found ${tasks.length} videos to convert to WebM...\n`);

async function convertVideo(task, index, total) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(task.output)) {
      console.log(`⏩ [${index}/${total}] ${task.name} already converted (${task.output}). Skipping.`);
      return resolve();
    }

    console.log(`⚡ [${index}/${total}] Converting ${task.name} -> WebM (VP9)...`);
    const startTime = Date.now();

    // VP9 encoding parameters optimized for web background video
    const args = [
      '-y',
      '-i', task.input,
      '-c:v', 'libvpx-vp9',
      '-crf', '32',
      '-b:v', '0',
      '-row-mt', '1',
      '-threads', '4',
      '-c:a', 'libopus',
      task.output
    ];

    const ffmpeg = spawn(ffmpegPath, args);

    ffmpeg.stderr.on('data', data => {
      // ffmpeg logs progress to stderr
      // Uncomment below if you want detailed ffmpeg output
      // process.stdout.write(data.toString());
    });

    ffmpeg.on('close', code => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      if (code === 0) {
        console.log(`✅ [${index}/${total}] Finished ${task.name} in ${elapsed}s!`);
        resolve();
      } else {
        console.error(`❌ [${index}/${total}] Failed ${task.name} with exit code ${code}`);
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
}

async function run() {
  for (let i = 0; i < tasks.length; i++) {
    try {
      await convertVideo(tasks[i], i + 1, tasks.length);
    } catch (err) {
      console.error('Error converting video:', err);
    }
  }
  console.log('\n🎉 All video conversions complete! You can now update your TSX files to use .webm sources.');
}

run();
