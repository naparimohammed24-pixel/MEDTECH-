// ===== SLIDER FUNCTIONALITY =====
let slides = document.querySelectorAll(".slide");
let currentSlide = 0;

function showSlide() {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[currentSlide].classList.add("active");
  currentSlide = (currentSlide + 1) % slides.length;
}

// Automatically change slide every 3 seconds
setInterval(showSlide, 3000);


// ===== CODE STUDIO FUNCTIONALITY =====

let activeTab = "html";

function openTab(tab) {
  document.querySelectorAll(".editor").forEach(e => e.classList.add("hidden"));
  document.getElementById(tab).classList.remove("hidden");
  activeTab = tab;
}

function runStudio() {
  const html = document.getElementById("html").value;
  const css = `<style>${document.getElementById("css").value}</style>`;
  const js = `<script>${document.getElementById("js").value}<\/script>`;
  const pythonCode = document.getElementById("python").value;
  const cppCode = document.getElementById("cpp").value;

  const iframe = document.getElementById("studioOutput");
  const outputText = document.getElementById("codeOutputText");

  if (activeTab === "html" || activeTab === "css" || activeTab === "js") {
    iframe.style.display = "block";
    outputText.style.display = "none";
    iframe.srcdoc = html + css + js;
  } else if (activeTab === "python") {
    iframe.style.display = "none";
    outputText.style.display = "block";

    // Skulpt Python execution
    function outf(text) { outputText.textContent += text + "\n"; }
    outputText.textContent = "";

    Sk.configure({output:outf, read:builtinRead});
    Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, pythonCode, true))
      .catch(err => { outputText.textContent += err.toString(); });

    function builtinRead(x) {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
          throw "File not found: '" + x + "'";
      return Sk.builtinFiles["files"][x];
    }
  } else if (activeTab === "cpp") {
    iframe.style.display = "none";
    outputText.style.display = "block";
    // Simple C++ demo: just show code (later can integrate WebAssembly)
    outputText.textContent = "⚠️ C++ execution requires WebAssembly setup\n\n" + cppCode;
  }
}

// Save / Reset / Download
function saveStudio() {
  ["html","css","js","python","cpp"].forEach(id => {
    localStorage.setItem("medtech-" + id, document.getElementById(id).value);
  });
  alert("Code saved ✔");
}

function resetStudio() { location.reload(); }

function downloadProject() {
  const content = `
<html>
<head><style>${document.getElementById("css").value}</style></head>
<body>
${document.getElementById("html").value}
<script>${document.getElementById("js").value}<\/script>
</body>
</html>`;
  const blob = new Blob([content], {type:"text/html"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "medtech-project.html";
  a.click();
}

// Load saved code
window.onload = () => {
  ["html","css","js","python","cpp"].forEach(id => {
    if(localStorage.getItem("medtech-" + id)){
      document.getElementById(id).value = localStorage.getItem("medtech-" + id);
    }
  });
}
// --- CODE STUDIO FUNCTIONS HERE ---
// openTab, runStudio, saveStudio, etc.

// --- CONTENTFUL FETCH ---
const SPACE_ID = "wh2jduuotak5";
const ACCESS_TOKEN = "-LgprZeoLtz64wCTTjVdFx1RrWA5C11ZtEk4UdrNW7g";
const API_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master/entries?access_token=${ACCESS_TOKEN}&include=2`;

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("posts");
    container.innerHTML = "";

    const assets = {};
    if (data.includes && data.includes.Asset) {
      data.includes.Asset.forEach(asset => {
        assets[asset.sys.id] = asset.fields.file.url;
      });
    }

    data.items.forEach(item => {
      const div = document.createElement("div");
      div.className = "post";

      if (item.fields.title) {
        const h2 = document.createElement("h2");
        h2.textContent = item.fields.title;
        div.appendChild(h2);
      }

      if (item.fields.video) {
        const videoId = item.fields.video.sys.id;
        const videoUrl = assets[videoId];
        if (videoUrl) {
          const video = document.createElement("video");
          video.src = "https:" + videoUrl;
          video.controls = true;
          video.style.width = "100%";
          div.appendChild(video);
        }
      }

      if(item.fields.codeHtml || item.fields.codeCss || item.fields.codeJs || item.fields.codePython || item.fields.codeCpp){
        const btn = document.createElement("button");
        btn.textContent = "Open in Code Studio";
        btn.onclick = () => {
          document.getElementById("html").value = item.fields.codeHtml || "";
          document.getElementById("css").value = item.fields.codeCss || "";
          document.getElementById("js").value = item.fields.codeJs || "";
          document.getElementById("python").value = item.fields.codePython || "";
          document.getElementById("cpp").value = item.fields.codeCpp || "";

          document.getElementById("code-studio").scrollIntoView({behavior:"smooth"});
          openTab("html");
        };
        div.appendChild(btn);
      }

      container.appendChild(div);
    });
  })
  .catch(err => console.error("Contentful fetch error:", err));
