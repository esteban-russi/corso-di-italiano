import { useState } from "react";

const conjugations = {
  fare:   ["faccio","fai","fa","facciamo","fate","fanno"],
  andare: ["vado","vai","va","andiamo","andate","vanno"],
  dire:   ["dico","dici","dice","diciamo","dite","dicono"],
};
const pronouns = ["io","tu","lui/lei","noi","voi","loro"];

const quiz = [
  { pronoun:"Tu",      verb:"Andare", answer:"vai" },
  { pronoun:"Io",      verb:"Fare",   answer:"faccio" },
  { pronoun:"Loro",    verb:"Dire",   answer:"dicono" },
  { pronoun:"Noi",     verb:"Andare", answer:"andiamo" },
  { pronoun:"Lui/Lei", verb:"Fare",   answer:"fa" },
  { pronoun:"Voi",     verb:"Dire",   answer:"dite" },
];

const impostor = {
  frases:[
    { id:"A", text:"Oggi io vado a fare la spesa al supermercato.", correct:true,  explain:null },
    { id:"B", text:"Cosa dicono voi? Non sento niente.", correct:false, explain:'La conjugación debe concordar con el sujeto. "Voi" pide "dite", no "dicono". Correcto: "Cosa dite voi?"' },
    { id:"C", text:"I ragazzi fannono un corso di cucina italiana.", correct:false, explain:'"Fannono" no existe. La 3ª persona plural de fare es "fanno". Correcto: "I ragazzi fanno un corso..."' },
  ],
};

const conversacion = [
  { role:"amico", text:'Ciao! Questo fine settimana sono libero. Tu cosa fai di bello? Hai qualche idea?' },
];

const STAGES = ["intro","bloque1","bloque2","bloque3"];

const verbColors = { fare:"c-purple", andare:"c-teal", dire:"c-coral" };

function ConjTable() {
  return (
    <div style={{overflowX:"auto",marginTop:8}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
        <thead>
          <tr>
            <th style={{padding:"8px 12px",textAlign:"left",color:"var(--color-text-secondary)",fontWeight:500,borderBottom:"0.5px solid var(--color-border-tertiary)"}}>Pronombre</th>
            {["Fare","Andare","Dire"].map(v=>(
              <th key={v} style={{padding:"8px 12px",textAlign:"center",fontWeight:500,borderBottom:"0.5px solid var(--color-border-tertiary)",color:"var(--color-text-primary)"}}>{v}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pronouns.map((p,i)=>(
            <tr key={p} style={{background: i%2===0?"var(--color-background-secondary)":"var(--color-background-primary)"}}>
              <td style={{padding:"8px 12px",color:"var(--color-text-secondary)",fontWeight:500}}>{p}</td>
              {["fare","andare","dire"].map(v=>(
                <td key={v} style={{padding:"8px 12px",textAlign:"center",fontWeight:500,color:"var(--color-text-primary)"}}>{conjugations[v][i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({text,color}){
  const map={purple:{bg:"#EEEDFE",cl:"#3C3489"},teal:{bg:"#E1F5EE",cl:"#0F6E56"},coral:{bg:"#FAECE7",cl:"#993C1D"},gray:{bg:"#F1EFE8",cl:"#5F5E5A"}};
  const s=map[color]||map.gray;
  return <span style={{background:s.bg,color:s.cl,fontSize:12,padding:"2px 10px",borderRadius:20,fontWeight:500}}>{text}</span>;
}

function Bloque1(){
  const [answers,setAnswers]=useState(Array(6).fill(""));
  const [checked,setChecked]=useState(false);
  const update=(i,v)=>{const a=[...answers];a[i]=v;setAnswers(a);};
  const check=()=>setChecked(true);
  const reset=()=>{setAnswers(Array(6).fill(""));setChecked(false);};
  const correct=(i)=>answers[i].trim().toLowerCase()===quiz[i].answer;
  return (
    <div>
      <p style={{fontSize:14,color:"var(--color-text-secondary)",marginBottom:16}}>Escribe la conjugación correcta para cada par. ¡Rápido!</p>
      <div style={{display:"grid",gap:10}}>
        {quiz.map((q,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--color-background-secondary)",borderRadius:10,border:"0.5px solid var(--color-border-tertiary)"}}>
            <span style={{fontWeight:500,fontSize:14,minWidth:24,color:"var(--color-text-secondary)"}}>{i+1}.</span>
            <span style={{fontSize:14,flex:1}}><b style={{fontWeight:500}}>{q.pronoun}</b> + <b style={{fontWeight:500}}>{q.verb}</b></span>
            <input
              value={answers[i]}
              onChange={e=>update(i,e.target.value)}
              disabled={checked}
              placeholder="..."
              style={{width:110,fontSize:14,padding:"6px 10px",borderRadius:8,border:`0.5px solid ${checked?(correct(i)?"#1D9E75":"#E24B4A"):"var(--color-border-secondary)"}`,background:checked?(correct(i)?"#E1F5EE":"#FCEBEB"):"var(--color-background-primary)",color:"var(--color-text-primary)",outline:"none"}}
            />
            {checked && <span style={{fontSize:13,fontWeight:500,color:correct(i)?"#0F6E56":"#A32D2D",minWidth:70}}>{correct(i)?"✓ Esatto!":"✗ → "+quiz[i].answer}</span>}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginTop:16}}>
        {!checked
          ? <button onClick={check} style={{padding:"8px 20px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",cursor:"pointer",fontWeight:500,fontSize:14}}>Verificar respuestas</button>
          : <button onClick={reset} style={{padding:"8px 20px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",cursor:"pointer",fontWeight:500,fontSize:14}}>Intentar de nuevo</button>
        }
        {checked && <span style={{fontSize:14,color:"var(--color-text-secondary)",alignSelf:"center"}}>
          {answers.filter((_,i)=>correct(i)).length}/6 correctas
        </span>}
      </div>
    </div>
  );
}

function Bloque2(){
  const [sel,setSel]=useState(null);
  const [revealed,setRevealed]=useState(false);
  return (
    <div>
      <p style={{fontSize:14,color:"var(--color-text-secondary)",marginBottom:16}}>Dos frases tienen un error. Selecciona cuál es la <b style={{fontWeight:500}}>única correcta</b>.</p>
      <div style={{display:"grid",gap:10}}>
        {impostor.frases.map(f=>{
          const isSelected=sel===f.id;
          const wrongPick=revealed&&isSelected&&!f.correct;
          const rightPick=revealed&&isSelected&&f.correct;
          const wrongUnpick=revealed&&!isSelected&&!f.correct;
          return (
            <div key={f.id} onClick={()=>!revealed&&setSel(f.id)} style={{padding:"12px 16px",borderRadius:10,cursor:revealed?"default":"pointer",border:`0.5px solid ${isSelected?"var(--color-border-secondary)":"var(--color-border-tertiary)"}`,background:rightPick?"#E1F5EE":wrongPick?"#FCEBEB":isSelected?"var(--color-background-secondary)":"var(--color-background-primary)",transition:"background 0.2s"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontWeight:500,fontSize:15,minWidth:24,marginTop:1,color:"var(--color-text-secondary)"}}>{"Frase "+f.id}</span>
                <span style={{fontSize:14,flex:1,fontStyle:"italic",color:"var(--color-text-primary)"}}>{f.text}</span>
                {revealed && <span style={{fontSize:16}}>{f.correct?"✅":wrongUnpick||wrongPick?"❌":""}</span>}
              </div>
              {revealed && !f.correct && (
                <p style={{fontSize:13,color:"#993C1D",marginTop:8,marginLeft:34,background:"#FAECE7",borderRadius:8,padding:"8px 12px"}}>{f.explain}</p>
              )}
              {revealed && f.correct && (
                <p style={{fontSize:13,color:"#0F6E56",marginTop:8,marginLeft:34,background:"#E1F5EE",borderRadius:8,padding:"8px 12px"}}>¡Perfecto! Esta frase es 100% correcta.</p>
              )}
            </div>
          );
        })}
      </div>
      <div style={{marginTop:14,display:"flex",gap:10}}>
        {!revealed
          ? <button onClick={()=>sel&&setRevealed(true)} disabled={!sel} style={{padding:"8px 20px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",cursor:sel?"pointer":"not-allowed",fontWeight:500,fontSize:14,opacity:sel?1:0.5}}>Revelar impostores</button>
          : <button onClick={()=>{setSel(null);setRevealed(false);}} style={{padding:"8px 20px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",cursor:"pointer",fontWeight:500,fontSize:14}}>Reiniciar</button>
        }
      </div>
    </div>
  );
}

function Bloque3(){
  const [msgs,setMsgs]=useState(conversacion);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [hint,setHint]=useState(false);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",text:input};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const history=newMsgs.map(m=>({role:m.role==="amico"?"assistant":"user",content:m.text}));
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`Sei un amico italiano esigente e divertente. Stai organizzando i piani per il weekend con uno studente di italiano. 
- Rispondi SEMPRE in italiano.
- Usa i verbi fare, andare e dire nel tuo testo.
- Correggi gentilmente gli errori grammaticali dello studente tra parentesi quadre alla fine, es: [Correzione: "vado", non "vo"].
- Mantieni la conversazione sul tema del weekend.
- Fai una domanda per continuare la conversazione.
- Risposte brevi e naturali (3-5 frasi).`,
          messages:history,
        })
      });
      const data=await res.json();
      const reply=data.content?.find(b=>b.type==="text")?.text||"...";
      setMsgs(m=>[...m,{role:"amico",text:reply}]);
    } catch(e){
      setMsgs(m=>[...m,{role:"amico",text:"(Errore di connessione — riprova!)"}]);
    }
    setLoading(false);
  };

  return (
    <div>
      <p style={{fontSize:14,color:"var(--color-text-secondary)",marginBottom:12}}>Responde en italiano usando <b style={{fontWeight:500}}>fare</b>, <b style={{fontWeight:500}}>andare</b> y <b style={{fontWeight:500}}>dire</b> al menos una vez. Tu amigo te corregirá si hay errores.</p>
      {hint&&<div style={{fontSize:13,background:"#E6F1FB",color:"#185FA5",borderRadius:8,padding:"10px 14px",marginBottom:12}}>
        Ejemplo: <i>"Io faccio una passeggiata domani e poi vado al mare. Tu cosa ne dici?"</i>
      </div>}
      <div style={{minHeight:180,maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:14,padding:"4px 0"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="amico"?"flex-start":"flex-end"}}>
            <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="amico"?"4px 12px 12px 12px":"12px 4px 12px 12px",background:m.role==="amico"?"var(--color-background-secondary)":"#EEEDFE",fontSize:14,lineHeight:1.6,color:"var(--color-text-primary)"}}>
              {m.role==="amico"&&<div style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:4}}>Amico italiano</div>}
              {m.text}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",background:"var(--color-background-secondary)",borderRadius:"4px 12px 12px 12px",maxWidth:"60%"}}>
          <span style={{fontSize:13,color:"var(--color-text-secondary)"}}>Sta scrivendo...</span>
        </div>}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
        <textarea
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Scrivi in italiano..."
          rows={2}
          style={{flex:1,fontSize:14,padding:"8px 12px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)",resize:"none",outline:"none",lineHeight:1.5}}
        />
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <button onClick={send} disabled={!input.trim()||loading} style={{padding:"8px 16px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",cursor:"pointer",fontWeight:500,fontSize:14,opacity:input.trim()&&!loading?1:0.5}}>Invia</button>
          <button onClick={()=>setHint(h=>!h)} style={{padding:"6px 16px",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)"}}>Pista</button>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [stage,setStage]=useState(0);

  const blocks=[
    { key:"intro", label:"Conjugaciones", icon:"ti-table", color:"gray" },
    { key:"b1",    label:"Bloque 1: Flash-Quiz", icon:"ti-bolt", color:"purple" },
    { key:"b2",    label:"Bloque 2: Impostor", icon:"ti-spy", color:"coral" },
    { key:"b3",    label:"Bloque 3: Rol", icon:"ti-messages", color:"teal" },
  ];

  return (
    <div style={{padding:"1rem 0",fontFamily:"var(--font-sans)"}}>
      <h2 className="sr-only">Clase interactiva de italiano — verbos fare, andare, dire</h2>

      <div style={{marginBottom:24,display:"flex",gap:8,flexWrap:"wrap"}}>
        {["fare","andare","dire"].map(v=>(
          <span key={v} style={{
            padding:"4px 16px",borderRadius:20,fontWeight:500,fontSize:13,
            background:{fare:"#EEEDFE",andare:"#E1F5EE",dire:"#FAECE7"}[v],
            color:{fare:"#3C3489",andare:"#0F6E56",dire:"#993C1D"}[v]
          }}>{v}</span>
        ))}
        <span style={{fontSize:13,color:"var(--color-text-secondary)",alignSelf:"center",marginLeft:4}}>Presente indicativo</span>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {blocks.map((b,i)=>(
          <button key={b.key} onClick={()=>setStage(i)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`0.5px solid ${stage===i?"var(--color-border-primary)":"var(--color-border-tertiary)"}`,background:stage===i?"var(--color-background-secondary)":"var(--color-background-primary)",cursor:"pointer",fontSize:13,fontWeight:stage===i?500:400,color:"var(--color-text-primary)"}}>
            <i className={`ti ${b.icon}`} style={{fontSize:15}} aria-hidden="true"/>
            {b.label}
          </button>
        ))}
      </div>

      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"20px 20px"}}>
        {stage===0 && (
          <>
            <h3 style={{fontSize:16,fontWeight:500,marginBottom:4}}>Presente indicativo — tabla de conjugaciones</h3>
            <p style={{fontSize:14,color:"var(--color-text-secondary)",marginBottom:12}}>Tres verbos irregulares esenciales. Estúdialos antes de los bloques.</p>
            <ConjTable/>
            <div style={{marginTop:18,padding:"12px 16px",background:"var(--color-background-secondary)",borderRadius:8,fontSize:13,color:"var(--color-text-secondary)",borderLeft:"3px solid #AFA9EC"}}>
              <b style={{fontWeight:500,color:"var(--color-text-primary)"}}>Truco de memoria:</b> <i>fare</i> y <i>dire</i> comparten la raíz irregular en singular (faccio / fai / fa · dico / dici / dice) y vuelven al patrón regular en plural, excepto la 3ª plural.
            </div>
            <button onClick={()=>setStage(1)} style={{marginTop:16,padding:"9px 22px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",cursor:"pointer",fontWeight:500,fontSize:14}}>
              Comenzar Bloque 1 →
            </button>
          </>
        )}
        {stage===1 && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <span style={{fontSize:22}} aria-hidden="true">🛑</span>
              <div>
                <h3 style={{fontSize:16,fontWeight:500,margin:0}}>Bloque 1 — El calentamiento</h3>
                <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"2px 0 0"}}>Flash-quiz de conjugación. Respuestas rápidas.</p>
              </div>
            </div>
            <Bloque1/>
          </>
        )}
        {stage===2 && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <span style={{fontSize:22}} aria-hidden="true">🧩</span>
              <div>
                <h3 style={{fontSize:16,fontWeight:500,margin:0}}>Bloque 2 — ¿Quién es el impostor?</h3>
                <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"2px 0 0"}}>Detecta el error antes de que se vuelva hábito.</p>
              </div>
            </div>
            <Bloque2/>
          </>
        )}
        {stage===3 && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <span style={{fontSize:22}} aria-hidden="true">💬</span>
              <div>
                <h3 style={{fontSize:16,fontWeight:500,margin:0}}>Bloque 3 — Simulación de rol</h3>
                <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"2px 0 0"}}>Conversa con tu amigo italiano. Él te corregirá.</p>
              </div>
            </div>
            <Bloque3/>
          </>
        )}
      </div>
    </div>
  );
}
