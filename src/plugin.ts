import type { PluginMessageEvent } from './model';


penpot.ui.open(
  'Image Lookup Plugin',
  `?theme=${penpot.theme}`,
  {
    width: 450,
    height: 750,
  }
);

penpot.on('themechange', (theme) => {
  sendMessage({ type: 'theme', content: theme });
});

function sendMessage(message: PluginMessageEvent) {
  penpot.ui.sendMessage(message);
}

penpot.ui.onMessage<{ type: string; data: any }>(async (message) => {
  if (message.type === 'import-photo') {
    const { photo, size } = message.data
    const photo_src = photo.src[size]   

    // Uploads image using url
    const imageData = await penpot.uploadMediaUrl(
      'imagefile', 
      photo_src
    )

    // Uses imageData to build a rectangle with the image as fill
    const shape = penpot.createRectangle();
    shape.boardX = penpot.viewport.center.x - (imageData.width / 2);
    shape.boardY = penpot.viewport.center.y - (imageData.height / 2);
    shape.resize(
      imageData.width,
      imageData.height
    );
    shape.fills = [
      {
        fillOpacity: 1,
        fillImage:
        {
          ...imageData,
          keepApectRatio: true
        }
      },
    ];
    shape.name = 'Photo by ' + photo.photographer
    // penpot.ui.sendMessage({
    //   type: "success-image",
    //   data: message.data.downloadEndpoint,
    // });
  }
});
