function toCamelCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

// TEXT 노드 재귀 수집
function collectTextNodes(node: SceneNode): TextNode[] {
  const result: TextNode[] = [];

  if (node.type === 'TEXT') {
    result.push(node);
  } else if ('children' in node) {
    for (const child of node.children) {
      result.push(...collectTextNodes(child));
    }
  }

  return result;
}

// 현재 선택된 모든 TEXT 노드 추출
function extractTexts(autoKeyId: boolean) {
  const selected = figma.currentPage.selection;
  const allTextNodes: TextNode[] = [];

  for (const node of selected) {
    allTextNodes.push(...collectTextNodes(node));
  }

  const texts = allTextNodes.map((node: TextNode) => {
    const localText = node.characters;
    const keyId = autoKeyId ? toCamelCase(localText) : '';
    return { keyId, localText };
  });
  return texts;
}

figma.showUI(__html__);

let autoKeyId = true;

figma.ui.onmessage = (msg) => {
  if (msg.type === 'update-autoKeyId') {
    autoKeyId = msg.value;
    const texts = extractTexts(autoKeyId);
    figma.ui.postMessage({ type: 'export-data', texts });
  }
};

// 초기 로드 시 선택된 텍스트 전송
const initialTexts = extractTexts(autoKeyId);
figma.ui.postMessage({ type: 'export-data', texts: initialTexts });

// selection이 바뀔 때마다 자동으로 텍스트 전송
figma.on('selectionchange', () => {
  const texts = extractTexts(autoKeyId);
  figma.ui.postMessage({ type: 'export-data', texts });
});
