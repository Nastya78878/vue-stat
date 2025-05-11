<!-- components/AppFooter.vue -->
<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="made-with">
        Сделано с
        <span class="heart" title="Love">♥</span>
      </p>
      <div class="repo-links">
        <a
          class="link-btn"
          href="https://github.com/HoldSnap/nest_stat"
          target="_blank"
          rel="noopener"
        >
          Backend
        </a>
        <a
          class="link-btn"
          href="https://github.com/HoldSnap/vue-stat"
          target="_blank"
          rel="noopener"
        >
          Frontend
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-footer {
  background: #fff;
  border-top: 1px solid #eee;
  padding: 1rem 0;
  width: 100%;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

.app-footer:hover {
  background: #333;
}

.footer-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  font-family: sans-serif;
  color: #555;
  transition: color 0.3s ease;
}

.app-footer:hover .footer-content {
  color: #fafafa;
}

.made-with {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.heart {
  display: inline-block;
  margin: 0 0.25rem;
  font-size: 1.1rem;
  line-height: 1;
  color: #333;
  border: 1px solid #333;
  border-radius: 50%;
  padding: 0.15rem 0.3rem;
  transition:
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.app-footer:hover .heart {
  background: #fafafa;
  color: #e76f51;
  border-color: #fafafa;
}

.repo-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.link-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: transparent;
  font-size: 0.85rem;
  color: #333;
  text-decoration: none;
  transition:
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.app-footer:hover .link-btn {
  background: transparent;
  border-color: #fafafa;
  color: #fafafa;
}

.link-btn:hover {
  background: #fafafa;
  color: #333;
}
</style>
