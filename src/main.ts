import './styles/variables.css';
import './styles/global.css';
import './styles/responsive.css';
import { App } from './app';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (root) {
    new App(root);
  }
});
