export function closest(node: Node, selector: string) {
  const element = node.nodeType === 1 ? node as Element : node.parentElement;
  return element?.closest(selector);
}
