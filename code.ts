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

figma.showUI(__html__);

// 초기 로드 시 선택된 텍스트 전송
figma.ui.postMessage({
  type: 'extract-texts',
  texts: extractTexts(),
});

// selection이 바뀔 때마다 자동으로 텍스트 전송
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'extract-texts',
    texts: extractTexts(),
  });
});
