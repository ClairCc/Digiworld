const boton = document.getElementById("submitWallet")

const sendQrRender = ()=>{
    const inputNombre = document.getElementById("nombreWallet").value;
    const inputUrl = document.getElementById("idWallet").value;
    const inputUrlSanitize = DOMPurify.sanitize(inputUrl);

    if (inputNombre === "" || inputUrlSanitize === "") {
        swal({
            title: "upsi",
            text: "Debe ir un formato valido ",
            type: "warning",
          })
    }else{
        axios({
            url: '/dashboard/adminMediosPago',
            method: 'POST',
            data: {
                inputNombre,
                inputUrlSanitize
            }
        }).then((res)=>{
            const response = res.data;
            const valor = response.qrData 
            
            console.log(valor)
        })
    }

   

   
}

class wallet{
    constructor({
        url, nombre
    }){
        this.nombre = nombre
        this.url = url
    }
}


const wallet1 = new wallet({
    url:"oisdnaosidnaiosd",
    nombre:"oisdnaosidnaiosd"
})



console.log(QRCode)
 
