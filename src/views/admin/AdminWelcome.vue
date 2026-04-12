<template>
  <section class="welcome-shell" :style="heroStyle">
    <div class="welcome-overlay">
      <div class="glow glow-left"></div>
      <div class="glow glow-right"></div>
      <div class="aurora aurora-one"></div>
      <div class="aurora aurora-two"></div>
      <div class="welcome-card">
        <p class="welcome-kicker">Admin Console</p>
        <h1>欢迎来到妙妙屋聊天室管理端</h1>
        <p class="welcome-desc">在这里统一管理用户、聊天记录、知识库与 AI 上下文。</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import aloraImage from '@/assets/alora.jpg'

const heroStyle = {
  backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.48)), url(${aloraImage})`,
}
</script>

<style scoped>
.welcome-shell {
  min-height: calc(100vh - 112px);
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
}

.welcome-overlay {
  min-height: calc(100vh - 112px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  isolation: isolate;
}

.glow,
.aurora {
  position: absolute;
  pointer-events: none;
  mix-blend-mode: screen;
}

.glow {
  width: 320px;
  height: 320px;
  border-radius: 999px;
  filter: blur(30px);
  opacity: 0.45;
  animation: drift 10s ease-in-out infinite;
}

.glow-left {
  left: 8%;
  top: 16%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(147, 197, 253, 0.42) 45%, rgba(147, 197, 253, 0) 72%);
}

.glow-right {
  right: 8%;
  bottom: 12%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(196, 181, 253, 0.4) 40%, rgba(196, 181, 253, 0) 74%);
  animation-delay: -4s;
}

.aurora {
  width: 42%;
  height: 180px;
  filter: blur(42px);
  opacity: 0.45;
}

.aurora-one {
  top: 12%;
  left: 18%;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0), rgba(96, 165, 250, 0.72), rgba(255, 255, 255, 0));
  transform: rotate(-12deg);
  animation: sweep 9s ease-in-out infinite;
}

.aurora-two {
  right: 16%;
  bottom: 18%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(129, 140, 248, 0.68), rgba(255, 255, 255, 0));
  transform: rotate(10deg);
  animation: sweep 11s ease-in-out infinite reverse;
}

.welcome-card {
  max-width: 620px;
  padding: 36px 40px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08));
  backdrop-filter: blur(18px);
  color: #eff6ff;
  text-align: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  animation: floatCard 6s ease-in-out infinite;
}

.welcome-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.05), rgba(191, 219, 254, 0.55));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.welcome-kicker {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
}

.welcome-card h1 {
  margin: 0;
  font-size: 40px;
  line-height: 1.15;
  font-weight: 700;
  text-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
}

.welcome-desc {
  margin: 16px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(239, 246, 255, 0.9);
}

@keyframes floatCard {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, -16px, 0) scale(1.08);
  }
}

@keyframes sweep {
  0%,
  100% {
    transform: translateX(0) rotate(-12deg);
  }
  50% {
    transform: translateX(28px) rotate(-6deg);
  }
}

@media (max-width: 768px) {
  .welcome-overlay {
    padding: 20px;
  }

  .welcome-card {
    padding: 22px;
  }

  .welcome-card h1 {
    font-size: 28px;
  }

  .aurora {
    width: 70%;
  }

  .glow {
    width: 220px;
    height: 220px;
  }
}
</style>
