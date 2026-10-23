// Keep Markdown editable while restoring the original image/text columns.
export default function editorialLayout() {
  return tree => {
    const element=(tagName,children,className)=>({type:'element',tagName,properties:className?{className:[className]}:{},children});
    const isImage=node=>node?.tagName==='p' && node.children?.some(child=>child.tagName==='img');
    const meaningful=nodes=>nodes.filter(node=>node.type!=='text'||node.value.trim());
    function columns(nodes){
      const imageIndex=nodes.findIndex(isImage);
      if(imageIndex<0) return null;
      const image=nodes[imageIndex];
      const credit=nodes[imageIndex+1];
      const hasCredit=credit?.tagName==='p'&&credit.children?.some(child=>child.tagName==='em');
      const figure=element('figure',[...image.children,...(hasCredit?[element('figcaption',credit.children)]:[])]);
      const text=nodes.filter((node,i)=>i!==imageIndex&&!(hasCredit&&i===imageIndex+1));
      return element('div',[figure,element('div',text)],'image-text');
    }
    const nodes=meaningful(tree.children);
    if(isImage(nodes[0])&&!nodes.some(node=>/^h[1-6]$/.test(node.tagName||''))){
      tree.children=[columns(nodes)];return;
    }
    const output=[];
    for(let i=0;i<nodes.length;){
      if(nodes[i].tagName!=='h2'){output.push(nodes[i++]);continue;}
      const heading=nodes[i++],section=[];
      while(i<nodes.length&&nodes[i].tagName!=='h2') section.push(nodes[i++]);
      const layout=columns(section);
      output.push(...(layout?[element('section',[heading,layout],'project-section')]:[heading,...section]));
    }
    tree.children=output;
  };
}
