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
        swal({
            title: "Proceso Realizado con Exito",
            text: "Billetera agregada correctamente",
            type: "success",
            confirmButtonText:
            'Continuar',
//Recargar la pagina
          })
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
        }).cath((err)=>{
            console.log(err)
        })
    }
    
}
