export default function AdminTable({title,columns,rows}){ return <section className='table-wrap'><h3>{title}</h3><table><thead><tr>{columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></section>; }


