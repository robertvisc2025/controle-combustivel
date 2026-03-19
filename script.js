let viagem
let contador

resetSistema()

function resetSistema(){

viagem={
embarcacao:"",
origem:{},
abastecimentos:[],
destino:{}
}

contador=1

}

function iniciarViagem(){

let nome=document.getElementById("embarcacao").value

if(!nome){
alert("Digite o nome da embarcação")
return
}

viagem.embarcacao=nome

document.getElementById("telaInicial").classList.add("hidden")
document.getElementById("inicioViagem").classList.remove("hidden")

}

function confirmarInicio(){

let origem=document.getElementById("origem").value
let data=document.getElementById("dataInicio").value
let hora=document.getElementById("horaInicio").value
let tanque=document.getElementById("tanqueInicio").value

if(!origem || !data || !hora || !tanque){
alert("Preencha todos os campos")
return
}

viagem.origem={
porto:origem,
data:data,
hora:hora,
tanque:tanque
}

document.getElementById("inicioViagem").classList.add("hidden")
document.getElementById("abastecimentoTela").classList.remove("hidden")
document.getElementById("downloadPdf").classList.remove("hidden")

atualizarNumero()

}

function atualizarNumero(){

document.getElementById("numeroAbastecimento").innerText=
contador+"º Abastecimento"

}

function salvarAbastecimento(){

let data=document.getElementById("dataAbastecimento").value
let hora=document.getElementById("horaAbastecimento").value
let tanque=document.getElementById("tanqueAbastecimento").value
let qtd=document.getElementById("qtdAbastecida").value

if(!data || !hora || !tanque || !qtd){
alert("Preencha todos os campos")
return
}

let abastecimento={
data:data,
hora:hora,
tanque:qtd?tanque:0,
quantidade:qtd
}

viagem.abastecimentos.push(abastecimento)

contador++

limparCampos()

atualizarNumero()

}

function limparCampos(){

document.getElementById("dataAbastecimento").value=""
document.getElementById("horaAbastecimento").value=""
document.getElementById("tanqueAbastecimento").value=""
document.getElementById("qtdAbastecida").value=""

}

function confirmarFinal(){

let r=confirm("Tem certeza que deseja finalizar a viagem?")

if(r){
document.getElementById("abastecimentoTela").classList.add("hidden")
document.getElementById("destinoTela").classList.remove("hidden")
}

}

function finalizarRegistro(){

let porto = document.getElementById("destino").value
let data = document.getElementById("dataDestino").value
let hora = document.getElementById("horaDestino").value
let tanque = document.getElementById("tanqueFinal").value

viagem.destino = {
porto: porto,
data: data,
hora: hora,
tanque: tanque
}

document.getElementById("destinoTela").classList.add("hidden")
document.getElementById("viagemFinalizada").classList.remove("hidden")

}

function novaViagem(){
location.reload()
}

document.getElementById("downloadPdf").addEventListener("click",gerarPDF)

function gerarPDF(){

const { jsPDF } = window.jspdf
let doc = new jsPDF()

let y=20

function linha(){
doc.setLineWidth(0.6)
doc.line(10,y,200,y)
y+=8
}

function campo(titulo,valor){

doc.setFont("helvetica","bold")
doc.text(titulo,10,y)

let larguraTitulo = doc.getTextWidth(titulo)

doc.setFont("helvetica","italic")
doc.text(String(valor),10 + larguraTitulo + 2,y)

y+=6

}

function toDate(data,hora){

if(!data || !hora) return null

let [d,m,a]=data.split("/")
let partes=hora.split(":")

let h=parseInt(partes[0])||0
let min=parseInt(partes[1])||0

return new Date(a,m-1,d,h,min)

}

function horasEntre(d1,d2){

if(!d1 || !d2) return 0

let diff=(d2-d1)/3600000

if(diff<0) diff=0

return diff

}

function fmtHoras(h){

if(!isFinite(h)) return "0h00"

let hh=Math.floor(h)
let mm=Math.round((h-hh)*60)

if(mm===60){
hh++
mm=0
}

return hh+"h"+String(mm).padStart(2,"0")

}

let totalHoras=0
let totalConsumido=0


// TÍTULO

doc.setFont("helvetica","bold")
doc.setFontSize(16)
doc.text("RELATÓRIO DE COMBUSTÍVEL",105,y,{align:"center"})
y+=8

doc.setFontSize(12)
doc.text(viagem.embarcacao || "",105,y,{align:"center"})
y+=10

linha()


// SAÍDA

doc.setFontSize(12)
doc.setFont("helvetica","bold")
doc.text("SAÍDA",10,y)
y+=8

doc.setFontSize(10)

campo("PORTO...........",viagem.origem.porto||"")
campo("DATA............",viagem.origem.data||"")
campo("HORA............",viagem.origem.hora||"")
campo("TANQUE..........",(viagem.origem.tanque||"")+"L")

y+=4

linha()

let prevData=viagem.origem.data
let prevHora=viagem.origem.hora
let prevTanque=parseFloat(viagem.origem.tanque)||0


// ABASTECIMENTOS

viagem.abastecimentos.forEach((ab,i)=>{

let tanqueAtual=parseFloat(ab.tanque)||0
let abastecido=parseFloat(ab.quantidade)||0

let consumo=prevTanque-tanqueAtual

if(isNaN(consumo)||consumo<0) consumo=0

let h=horasEntre(toDate(prevData,prevHora),toDate(ab.data,ab.hora))

let media=h>0?consumo/h:0

totalHoras+=h
totalConsumido+=consumo

doc.setFontSize(12)
doc.setFont("helvetica","bold")
doc.text((i+1)+"º ABASTECIMENTO",10,y)
y+=7

doc.setFontSize(10)

campo("DATA............",ab.data)
campo("HORA............",ab.hora)
campo("TANQUE..........",tanqueAtual+"L")
campo("ABASTECIDO......",abastecido+"L")
campo("CONSUMIDO.......",consumo.toFixed(0)+"L")
campo("TEMPO...........",fmtHoras(h))
campo("MÉDIA/HORA......",media.toFixed(2)+" L/h")

y+=4

linha()

prevData=ab.data
prevHora=ab.hora
prevTanque=tanqueAtual+abastecido

})


// DESTINO FINAL

let destinoTanque=parseFloat(viagem.destino.tanque)||0

let consumoFinal=prevTanque-destinoTanque

if(isNaN(consumoFinal)||consumoFinal<0) consumoFinal=0

let hFinal=horasEntre(toDate(prevData,prevHora),toDate(viagem.destino.data,viagem.destino.hora))

let mediaFinal=hFinal>0?consumoFinal/hFinal:0

totalHoras+=hFinal
totalConsumido+=consumoFinal


doc.setFontSize(12)
doc.setFont("helvetica","bold")
doc.text("DESTINO FINAL",10,y)
y+=8

doc.setFontSize(10)

campo("PORTO...........",viagem.destino.porto||"")
campo("DATA............",viagem.destino.data||"")
campo("HORA............",viagem.destino.hora||"")
campo("TANQUE..........",destinoTanque+"L")
campo("CONSUMIDO.......",consumoFinal.toFixed(0)+"L")
campo("MÉDIA/HORA......",mediaFinal.toFixed(2)+" L/h")

y+=4

linha()


// INFORMAÇÕES FINAIS

let mediaTotal=totalHoras>0?totalConsumido/totalHoras:0

doc.setFontSize(12)
doc.setFont("helvetica","bold")
doc.text("INFORMAÇÕES FINAIS",10,y)
y+=8

doc.setFontSize(10)

campo("HORAS VIAJADAS...",fmtHoras(totalHoras))
campo("CONSUMO TOTAL....",totalConsumido.toFixed(0)+"L")
campo("MÉDIA TOTAL......",mediaTotal.toFixed(2)+" L/h")


doc.save("Relatorio_"+viagem.embarcacao+".pdf")

}



// FORMATA DATA

document.querySelectorAll("#dataInicio,#dataAbastecimento,#dataDestino").forEach(campo=>{

campo.addEventListener("input",function(){

let valor=this.value.replace(/\D/g,"")

if(valor.length>8) valor=valor.slice(0,8)

if(valor.length>=5){
this.value=valor.slice(0,2)+"/"+valor.slice(2,4)+"/"+valor.slice(4)
}
else if(valor.length>=3){
this.value=valor.slice(0,2)+"/"+valor.slice(2)
}
else{
this.value=valor
}

})

})



// FORMATA HORA

document.querySelectorAll("#horaInicio,#horaAbastecimento,#horaDestino").forEach(campo=>{

campo.addEventListener("input",function(){

let valor=this.value.replace(/\D/g,"")

if(valor.length>4) valor=valor.slice(0,4)

if(valor.length>=3){
this.value=valor.slice(0,2)+":"+valor.slice(2)
}
else{
this.value=valor
}

})

})