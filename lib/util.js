const mix = function(a, b, t) {
    return a * (1.0-t) + b * t;
};
function normalize(val, min, max) {
  return Math.min(Math.max((val - min) / (max - min), 0), 1);
}
{const top=0,parent=c=>(c+1>>>1)-1,left=c=>(c<<1)+1,right=c=>c+1<<1;class PriorityQueue{constructor(c=(d,e)=>d>e){this._heap=[],this._comparator=c}size(){return this._heap.length}isEmpty(){return 0==this.size()}peek(){return this._heap[top]}push(...c){return c.forEach(d=>{this._heap.push(d),this._siftUp()}),this.size()}pop(){const c=this.peek(),d=this.size()-1;return d>top&&this._swap(top,d),this._heap.pop(),this._siftDown(),c}replace(c){const d=this.peek();return this._heap[top]=c,this._siftDown(),d}_greater(c,d){return this._comparator(this._heap[c],this._heap[d])}_swap(c,d){[this._heap[c],this._heap[d]]=[this._heap[d],this._heap[c]]}_siftUp(){for(let c=this.size()-1;c>top&&this._greater(c,parent(c));)this._swap(c,parent(c)),c=parent(c)}_siftDown(){for(let d,c=top;left(c)<this.size()&&this._greater(left(c),c)||right(c)<this.size()&&this._greater(right(c),c);)d=right(c)<this.size()&&this._greater(right(c),left(c))?right(c):left(c),this._swap(c,d),c=d}}window.PriorityQueue=PriorityQueue}