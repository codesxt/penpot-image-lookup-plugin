import type { PluginMessageEvent } from './model';

penpot.ui.open(
  'Image Lookup Plugin',
  `?theme=${penpot.theme}`,
  {
    width: 450,
    height: 650,
  }
);

penpot.on('themechange', (theme) => {
  sendMessage({ type: 'theme', content: theme });
});

function sendMessage(message: PluginMessageEvent) {
  penpot.ui.sendMessage(message);
}
