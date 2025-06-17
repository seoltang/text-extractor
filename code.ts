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
function extractTexts() {
  const selected = figma.currentPage.selection;
  const allTextNodes: TextNode[] = [];

  for (const node of selected) {
    allTextNodes.push(...collectTextNodes(node));
  }

  return allTextNodes.map((node: TextNode) => ({
    text: node.characters,
  }));
}

const STORAGE_KEY = 'delimiter-sets';

figma.showUI(__html__, { width: 500, height: 800 });

// 초기 로드 시 선택된 텍스트 전송
figma.ui.postMessage({
  type: 'extract-texts',
  texts: extractTexts(),
});

// 저장된 Delimiter Set 불러오기
figma.clientStorage.getAsync(STORAGE_KEY).then((sets) => {
  figma.ui.postMessage({
    type: 'load-delimiter-sets',
    sets: sets || [],
  });
});

// selection이 바뀔 때마다 자동으로 텍스트 전송
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'extract-texts',
    texts: extractTexts(),
  });
});

// UI로부터 메시지 수신
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'save-delimiter-sets') {
    await figma.clientStorage.setAsync(STORAGE_KEY, msg.sets);
  }
};
