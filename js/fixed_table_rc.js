/**
 * A jQuery plugin to convert a well formatted table into a table with fixed
 * rows and columns.
 *
 * Forked from http://meetselva.github.io/
 * No support for colspan
 */

( function ( $ ) {

    $.fn.fixedTableRowsCols = function ( options ) {
        var config = {
            height: '100%',
            width: '100%',
            fixedCols: 1,
            tableTmpl: function ( className ) {
                return '<table class="' + className + '" />';
            }
        };

        $.extend( config, options );

        //  For each table found
        return this.each( function () {
            var $this = $( this );
            var $fixedTableContainer;
            var $fixedTableRelContainer;
            var $fixedTableWrapper;
            var $fixedRows;
            var $fixedCols;
            var $fixedRowCols;
            var thHeight = $this.find( 'tr:first-child th:first-child' ).outerHeight();
            var tdHeight = $this.find( 'tr:first-child td:first-child' ).outerHeight();
            var tableWidth = $this.outerWidth();
            var tableHeight = 0;
            var fixedColWidth = 0;

            // Set the width and height of each td & th based on the default
            // rendering of the table. Agnostic to how table and cell widths
            // are defined before this plugin is invoked, and does not take
            // in any values to set whose widths.

            $this.find( 'th' ).css({
                height: thHeight,
                width: function ( index, style ) {
                    return style;
                }
            });

            // $this.find( 'td' ).css({
            //     height: tdHeight,
            //     width: function ( index, style ) {
            //         return style;
            //     }
            // });

            $this.width( tableWidth );

            // Calculate the fixedColWidth
            fixedColWidth = _.reduce(
                _.map(
                    $this.find(
                        'tr:first-child th:nth-child(-n + ' +
                        config.fixedCols +
                        ')' ),
                    function ( el ) {
                        return $( el ).outerWidth();
                    }),
                function ( memo, num ) {
                    return memo + num;
                });

            // Wrap table in a container to define the scrollable area
            $this.wrap( '<div class="ft-container" />' );

            $fixedTableContainer = $this.parent().css({
                width: config.width,
                height: config.height
            });

            // Add relative container
            $this.wrap( '<div class="ft-rel-container" />' );
            $fixedTableRelContainer = $this.parent();

            // Add wrapper to base table which will have the scrollbars
            $this.wrap( '<div class="ft-scroller" />' );
            $fixedTableWrapper = $this.parent().css( 'width', config.width - 5 );

            // Create a new table for each fixed portions

            // Fixed Rows (assumes entire <thead> is fixed)
            $fixedRows = $( config.tableTmpl( 'ft-r' ) )
                .append( $this.find( 'thead' ).clone() );

            $fixedTableRelContainer.prepend( $fixedRows );

            $fixedRows.wrap( $( '<div class="ft-rwrapper" />' ) );
            $fixedRows.width( tableWidth );

            if ( config.fixedCols > 0 ) {
                // Upper Left corner, cells that lie in both the fixed row and cols
                $fixedRowCols = $( config.tableTmpl( 'ft-rc' ) )
                        .append( $this.find( 'thead' ).clone() );

                $fixedRowCols
                    .find( 'th:nth-child( n + ' + ( config.fixedCols + 1 ) + ' )' )
                    .remove();

                // Add fixed row+col section
                $fixedTableRelContainer
                    .prepend( $fixedRowCols );

                // Fixed Columns
                // Clone the fixed row column and append tbody for the remaining rows
                $fixedCols = $fixedRowCols.clone();
                $fixedCols[ 0 ].className = 'ft-c';
                $fixedCols.append( $this.find( 'tbody' ).clone() );
                $fixedCols
                    .find( 'td:nth-child( n + ' + ( config.fixedCols + 1 ) + ' )' )
                    .remove();

                // Append the Fixed Columns
                $fixedRowCols.after( $fixedCols );
                $fixedCols.wrap( $( '<div class="ft-cwrapper" />' ) );

                // Set the width of the Fixed Columns and Fixed Row-Columns
                $fixedCols.add( $fixedRowCols ).width( fixedColWidth );
                $fixedCols.height( $this.outerHeight( true ) );

                // Set the width && height of the wrapper
                $fixedCols
                    .parent()
                    .css({
                        height: $fixedTableContainer.height()
                    })
                    .width( $fixedRowCols.outerWidth( true ) + 1 );
            }

            $fixedRows
                .parent()
                .css({
                    width: $fixedTableWrapper.width()
                });

            // Events ( scroll and resize ). animate() is faster than css()
            $fixedTableWrapper.scroll( function () {
                if ( config.fixedCols > 0 ) {
                    // $fixedCols.css( 'top', ( $( this ).scrollTop() * -1 ) );

                    $fixedCols.animate({ top:  $( this ).scrollTop() * -1 }, 0 );
                }

                $fixedRows.animate({ left: $( this ).scrollLeft() * -1 }, 0 );
            });
        });
    };
})( jQuery );