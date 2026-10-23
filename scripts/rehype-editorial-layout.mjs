// Preserve Markdown order; standalone pictures become figures in place.
export default function editorialLayout() {
  return tree => {
    const element=(tagName,children,className)=>({type:'element',tagName,properties:className?{className:[className]}:{},children});
    const meaningful=nodes=>nodes.filter(node=>node.type!=='text'||node.value.trim());
    const text=node=>node.type==='text'?node.value:(node.children||[]).map(text).join('');
    const isPicture=node=>node.tagName==='img'||(node.tagName==='a'&&meaningful(node.children||[]).length===1&&node.children.some(child=>child.tagName==='img'));
    function visit(parent){
      if(!parent.children)return;
      const output=[];
      for(let i=0;i<parent.children.length;i++){
        const node=parent.children[i];
        visit(node);
        const children=meaningful(node.children||[]);
        if(node.tagName!=='p'||!children.length||!children.every(isPicture)){output.push(node);continue;}
        const image=children[0].tagName==='img'?children[0]:children[0].children.find(child=>child.tagName==='img');
        let next=i+1;
        while(parent.children[next]?.type==='text'&&!parent.children[next].value.trim())next++;
        const credit=parent.children[next];
        const isCredit=credit?.tagName==='p'&&meaningful(credit.children).every(child=>child.tagName==='em')&&/©|copyright|foto|photo/i.test(text(credit));
        const figure=element('figure',[...children], 'richtext-image');
        if(isCredit){figure.children.push(element('figcaption',credit.children));i=next;}
        else if(image?.properties?.title)figure.children.push(element('figcaption',[{type:'text',value:String(image.properties.title)}]));
        output.push(figure);
      }
      parent.children=output;
    }
    visit(tree);
  };
}
