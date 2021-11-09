!
function(e)
{
	"use strict";

	function t()
	{
		e("#contactForm").removeClass().addClass("shake animated").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function()
		{
			e(this).removeClass()
		})
	}
	function a(t, a)
	{
		if (t) var n = "h4 text-center tada animated text-success";
		else n = "h4 text-center text-danger";
		e("#msgSubmit").removeClass().addClass(n).text(a)
	}
	e("#contactForm").validator().on("submit", function(n)
	{
		var s, i, o, m, r;
		n.isDefaultPrevented() ? (t(), a(!1, "¿Completó correctamente el formulario?")) : (n.preventDefault(), s = e("#name").val(), i = e("#email").val(), o = e("#msg_subject").val(), m = e("#phone_number").val(), r = e("#message").val(), e.ajax(
		{
			type: "POST",
			url: "assets/php/form-process.php",
			data: "name=" + s + "&email=" + i + "&msg_subject=" + o + "&phone_number=" + m + "&message=" + r,
			success: function(n)
			{
				"success" == n ? (e("#contactForm")[0].reset(), a(!0, "Solicitud Enviada!")) : (t(), a(!1, n))
			}
		}))
	})
}(jQuery);