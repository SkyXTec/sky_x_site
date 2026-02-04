// Ponto de entrada principal da aplicação
import { initButtonEffects } from './button-effects.js';
import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initCarousel } from './carousel.js';
import { initModal } from './modal.js';

document.addEventListener("DOMContentLoaded", () => {
  initButtonEffects();
  initNavigation();
  initAnimations();
  initCarousel();
  initModal();
});
