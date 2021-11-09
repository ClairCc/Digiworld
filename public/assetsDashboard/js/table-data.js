$(function () {
   'use strict'

   //Data table example
   var table = $('#exportexample_date').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
         buttons: {
            'copy': 'Copiar',
            'excel': 'Excel',
            'pdf': 'PDF',
            'colvis': 'Ocultar columnas'
         },
         paginate: {
            'first': 'Primero',
            'last': 'Último',
            'next': 'Siguiente',
            'previous': 'Anterior'
         },
      },
      lengthChange: false,
      buttons: ['copy', 'excel', 'pdf', 'colvis'],
      "bSort": false
   });
   table.buttons().container()
      .appendTo('#exportexample_date_wrapper .col-md-6:eq(0)');

   // exportexample_admin_renovaciones
   var table = $('#exportexample_admin_renovaciones').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
         buttons: {
            'copy': 'Copiar',
            'excel': 'Excel',
            'pdf': 'PDF',
            'colvis': 'Ocultar columnas'
         },
         paginate: {
            'first': 'Primero',
            'last': 'Último',
            'next': 'Siguiente',
            'previous': 'Anterior'
         },
      },
      lengthChange: false,
      buttons: ['copy', 'excel', 'pdf', 'colvis'],
      "bSort": false
   });
   table.buttons().container()
      .appendTo('#exportexample_admin_renovaciones_wrapper .col-md-6:eq(0)');


   // exportexample_admin_bajo_pedido
   var table = $('#tablageneralsinfiltro').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
         buttons: {
            'copy': 'Copiar',
            'excel': 'Excel',
            'pdf': 'PDF',
            'colvis': 'Ocultar columnas'
         },
         paginate: {
            'first': 'Primero',
            'last': 'Último',
            'next': 'Siguiente',
            'previous': 'Anterior'
         },
      },
      lengthChange: false,
      buttons: ['copy', 'excel', 'pdf', 'colvis'],
      "bSort": false
   });
   table.buttons().container()
      .appendTo('#tablageneralsinfiltro_wrapper .col-md-6:eq(0)');

   var table = $('#exportexample').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
         buttons: {
            'copy': 'Copiar',
            'excel': 'Excel',
            'pdf': 'PDF',
            'colvis': 'Ocultar columnas'
         },
         paginate: {
            'first': 'Primero',
            'last': 'Último',
            'next': 'Siguiente',
            'previous': 'Anterior'
         },
      },
      lengthChange: false,
      buttons: ['copy', 'excel', 'pdf', 'colvis'],
      "bSort": false
   });
   table.buttons().container()
      .appendTo('#exportexample_wrapper .col-md-6:eq(0)');

   var table = $('#exportexamplecargas').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
         buttons: {
            'copy': 'Copiar',
            'excel': 'Excel',
            'pdf': 'PDF',
            'colvis': 'Ocultar columnas'
         },
         paginate: {
            'first': 'Primero',
            'last': 'Último',
            'next': 'Siguiente',
            'previous': 'Anterior'
         },
      },
      lengthChange: false,
      buttons: ['copy', 'excel', 'pdf', 'colvis'],
      "bSort": false
   });
   table.buttons().container()
      .appendTo('#exportexamplecargas_wrapper .col-md-6:eq(0)');

   // Cuentas vendidas
   var table = $('#exportexamplecuentas').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
         buttons: {
            'copy': 'Copiar',
            'excel': 'Excel',
            'pdf': 'PDF',
            'colvis': 'Ocultar columnas'
         },
         paginate: {
            'first': 'Primero',
            'last': 'Último',
            'next': 'Siguiente',
            'previous': 'Anterior'
         },
      },
      lengthChange: false,
      buttons: ['copy', 'excel', 'pdf', 'colvis'],
      "bSort": false
   });
   table.buttons().container()
      .appendTo('#exportexamplecuentas_wrapper .col-md-6:eq(0)');

   var table = $('#exportexamplecuentas_red').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
         buttons: {
            'copy': 'Copiar',
            'excel': 'Excel',
            'pdf': 'PDF',
            'colvis': 'Ocultar columnas'
         },
         paginate: {
            'first': 'Primero',
            'last': 'Último',
            'next': 'Siguiente',
            'previous': 'Anterior'
         },
      },
      lengthChange: false,
      buttons: ['copy', 'excel', 'pdf', 'colvis'],
      "bSort": false
   });
   table.buttons().container()
      .appendTo('#exportexamplecuentas_wrapper .col-md-6:eq(0)');

   $('#example1').DataTable({
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
      }
   });
   $('#example2').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
      }
   });

   $('#tablaAsignar').DataTable({
      pageLength: 50,
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
      }
   });

   var reporte = $('#tableReportes').DataTable({
      responsive: true,
      language: {
         searchPlaceholder: 'Buscar...',
         sSearch: '',
         lengthMenu: '_MENU_ filas/pagina',
      },
      lengthChange: false,
      buttons: ['copy', 'excel']
   });
   reporte.buttons().container()
      .appendTo('#exportexample_wrapper .col-md-6:eq(0)');

   $('#example3').DataTable({
      responsive: {
         details: {
            display: $.fn.dataTable.Responsive.display.modal({
               header: function (row) {
                  var data = row.data();
                  return 'Details for ' + data[0] + ' ' + data[1];
               }
            }),
            renderer: $.fn.dataTable.Responsive.renderer.tableAll({
               tableClass: 'table'
            })
         }
      }
   });

   /*Input Datatable*/
   var table = $('#example-input').DataTable({
      'columnDefs': [
         {
            'targets': [1, 2, 3, 4, 5],
            'render': function (data, type, row, meta) {
               if (type === 'display') {
                  var api = new $.fn.dataTable.Api(meta.settings);

                  var $el = $('input, select, textarea', api.cell({ row: meta.row, column: meta.col }).node());

                  var $html = $(data).wrap('<div/>').parent();

                  if ($el.prop('tagName') === 'INPUT') {
                     $('input', $html).attr('value', $el.val());
                     if ($el.prop('checked')) {
                        $('input', $html).attr('checked', 'checked');
                     }
                  } else if ($el.prop('tagName') === 'TEXTAREA') {
                     $('textarea', $html).html($el.val());

                  } else if ($el.prop('tagName') === 'SELECT') {
                     $('option:selected', $html).removeAttr('selected');
                     $('option', $html).filter(function () {
                        return ($(this).attr('value') === $el.val());
                     }).attr('selected', 'selected');
                  }

                  data = $html.html();
               }

               return data;
            }
         }
      ],
      'responsive': true
   });
   $('#example-input tbody').on('keyup change', '.child input, .child select, .child textarea', function (e) {
      var $el = $(this);
      var rowIdx = $el.closest('ul').data('dtr-index');
      var colIdx = $el.closest('li').data('dtr-index');
      var cell = table.cell({ row: rowIdx, column: colIdx }).node();
      $('input, select, textarea', cell).val($el.val());
      if ($el.is(':checked')) {
         $('input', cell).prop('checked', true);
      } else {
         $('input', cell).removeProp('checked');
      }
   });

   $('table').on('draw.dt', function () {
      $('.select2-no-search').select2({
         minimumResultsForSearch: Infinity,
         placeholder: 'Choose one'
      });
   });

});