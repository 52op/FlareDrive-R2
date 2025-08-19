<template>
  <footer class="footer">
    <div class="icons">
      <a :href="homeUrl" target="_blank" rel="noopener noreferrer" class="icon-link" title="个人主页">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"></path></svg>
      </a>
      <a :href="blogUrl" target="_blank" rel="noopener noreferrer" class="icon-link" title="站长博客">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M192 32c0 17.7 14.3 32 32 32c123.7 0 224 100.3 224 224c0 17.7 14.3 32 32 32s32-14.3 32-32C512 128.9 383.1 0 224 0c-17.7 0-32 14.3-32 32zm0 96c0 17.7 14.3 32 32 32c70.7 0 128 57.3 128 128c0 17.7 14.3 32 32 32s32-14.3 32-32c0-106-86-192-192-192c-17.7 0-32 14.3-32 32zM96 144c0-26.5-21.5-48-48-48S0 117.5 0 144L0 368c0 79.5 64.5 144 144 144s144-64.5 144-144s-64.5-144-144-144l-16 0 0 96 16 0c26.5 0 48 21.5 48 48s-21.5 48-48 48s-48-21.5-48-48l0-224z"/></svg>
      </a>
      <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="icon-link" title="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 512"><path d="M186.1 328.7c0 20.9-10.9 55.1-36.7 55.1s-36.7-34.2-36.7-55.1 10.9-55.1 36.7-55.1 36.7 34.2 36.7 55.1zM480 278.2c0 31.9-3.2 65.7-17.5 95-37.9 76.6-142.1 74.8-216.7 74.8-75.8 0-186.2 2.7-225.6-74.8-14.6-29-20.2-63.1-20.2-95 0-41.9 13.9-81.5 41.5-113.6-5.2-15.8-7.7-32.4-7.7-48.8 0-21.5 4.9-32.3 14.6-51.8 45.3 0 74.3 9 108.8 36 29-6.9 58.8-10 88.7-10 27 0 54.2 2.9 80.4 9.2 34-26.7 63-35.2 107.8-35.2 9.8 19.5 14.6 30.3 14.6 51.8 0 16.4-2.6 32.7-7.7 48.2 27.5 32.4 39 72.3 39 114.2zm-64.3 50.5c0-43.9-26.7-82.6-73.5-82.6-18.9 0-37 3.4-56 6-14.9 2.3-29.8 3.2-45.1 3.2-15.2 0-30.1-.9-45.1-3.2-18.7-2.6-37-6-56-6-46.8 0-73.5 38.7-73.5 82.6 0 87.8 80.4 101.3 150.4 101.3h48.2c70.3 0 150.6-13.4 150.6-101.3zm-82.6-55.1c-25.8 0-36.7 34.2-36.7 55.1s10.9 55.1 36.7 55.1 36.7-34.2 36.7-55.1-10.9-55.1-36.7-55.1z"></path></svg>
      </a>
      <a :href="emailUrl" target="_blank" rel="noopener noreferrer" class="icon-link" title="站长邮箱">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"></path></svg>
      </a>
    </div>

    <div class="stats">
      访问次数：<span id="vercount_value_site_pv">😯</span>次 | 访客人数：<span id="vercount_value_site_uv">😯</span>人
    </div>

    <div class="project-links">
      <strong>到这已经是第四开了:</strong><a href="https://github.com/marktube/FlareDrive-R2" target="_blank"
        rel="noopener noreferrer">FlareDrive-R2增强优化版</a>
      <strong>到这已经是第三开了:</strong><a href="https://github.com/52op/FlareDrive-R2" target="_blank"
        rel="noopener noreferrer">FlareDrive-R2增强版</a>
      <strong>感谢:</strong><a href="https://github.com/willow-god/FlareDrive-R2" target="_blank"
        rel="noopener noreferrer">FlareDrive-R2</a>
      <strong>初始项目:</strong><a href="https://github.com/ljxi/Cloudflare-R2-oss" target="_blank"
        rel="noopener noreferrer">Cloudflare-R2-OSS</a>
    </div>

    <div class="powered">Powered by <a href="https://workers.cloudflare.com/" target="_blank"
        rel="noopener noreferrer">Cloudflare Workers</a></div>

    <div style="margin:10px 0;">© 2025 FlareDrive. All rights reserved.</div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  data() {
    return {
      homeUrl: "https://blog.liuyc.uk/about.html",
      blogUrl: "https://blog.liuyc.uk/",
      githubUrl: "https://github.com/marktube",
      emailUrl: "mailto:liuyc@sem.tsinghua.edu.cn"
    };
  }
};
</script>


<style scoped>
.footer {
  margin-top: 30px;
  text-align: center;
  padding: 20px;
  background-color: #ffffff77;
  font-size: 16px;
  border-radius: 50% 50% 0 0;

}

.icons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 25px;
}

.icon-link {
  width: 28px;
  height: 28px;
  display: inline-block;
  fill: #2c2c2c;
  transition: fill 0.3s;
}

.icon-link:hover {
  fill: #444;
}

.stats {
  margin: 10px 0;
  color: #444;
}

.project-links {
  font-size: 14px;
  color: #444;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  text-align: center;
}

.project-links a {
  color: #444;
  text-decoration: none;
}

.project-links a:hover {
  color: #222;
}

.powered {
  margin-top: 10px;
  color: #444;
}

.powered a {
  color: #444;
  text-decoration: none;
}

.powered a:hover {
  color: #222;
}
</style>
