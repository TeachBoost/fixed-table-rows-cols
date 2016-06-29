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
            height: 500,
            width: 2000,
            fixedCols: 1,
            fixedTHead: true,
            addScrollers: false,
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
            var $scrollLeft;
            var $scrollRight;
            var thHeight = $this.find( 'tr:first-child th:first-child' ).outerHeight();
            var tdHeight = $this.find( 'tr:first-child td:first-child' ).outerHeight();
            var tableWidth = $this.outerWidth();
            var tableHeight = 0;
            var fixedColWidth = 0;
            var scrollStep = 0;

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
            $fixedTableWrapper = $this.parent().css( 'width', $fixedTableContainer.width() );

            // Create a new table for each fixed portions

            if ( config.fixedTHead ) {
                // Fixed Rows
                $fixedRows = $( config.tableTmpl( 'ft-r' ) )
                    .append( $this.find( 'thead' ).clone() );

                $fixedTableRelContainer.prepend( $fixedRows );

                $fixedRows.wrap( $( '<div class="ft-rwrapper" />' ) );
                $fixedRows.width( tableWidth );
            }

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

                if ( config.addScrollers ) {
                    // Add scroll indicators
                    $scrollLeft = $( '<div class="ft-scroll-left" />' );
                    $scrollLeft.append( '<i class="fa fa-chevron-left" />' );
                    $scrollRight = $( '<div class="ft-scroll-right" />' );
                    $scrollRight.append( '<i class="fa fa-chevron-right" />' );
                    $scrollLeft.css( { left: $fixedRowCols.outerWidth( true ) } );
                    $fixedTableRelContainer.append( $scrollLeft );
                    $fixedTableRelContainer.append( $scrollRight );
                }
            }

            $fixedRows
                .parent()
                .css({
                    width: $fixedTableWrapper.width()
                });

            // Events
            // Scrolling
            $fixedTableWrapper.scroll( function () {
                if ( config.fixedCols > 0 ) {
                    // animate() is faster than css()
                    $fixedCols.animate({ top: $( this ).scrollTop() * -1 }, 0 );
                }

                $fixedRows.animate({ left: $( this ).scrollLeft() * -1 }, 0 );
            });

            if ( config.addScrollers && config.fixedCols > 0 ) {
                scrollStep = $fixedTableWrapper.width() - fixedColWidth * 0.5;
                // $fixedTableRowsCols.add( $scrollLeft ).add( $scrollRight ).on( 'mouseover', function () {
                $this.add( $scrollLeft ).add( $scrollRight ).on( 'mouseover', function () {
                    showScrollers();
                });

                $fixedCols.add( $fixedRows ).on( 'mouseover', function () {
                    $scrollLeft.fadeOut( 'fast' );
                    $scrollRight.fadeOut( 'fast' );
                });

                $scrollLeft.on( 'click', function () {
                    $fixedTableWrapper.animate({
                        scrollLeft: Math.max( 0, $fixedTableWrapper.scrollLeft() - scrollStep )
                    }, 500, showScrollers() );
                });

                $scrollRight.on( 'click', function () {
                    $fixedTableWrapper.animate({
                        scrollLeft: Math.min(
                            $this.width() - $fixedTableWrapper.width(),
                            $fixedTableWrapper.scrollLeft() + scrollStep )
                    }, 500, showScrollers() );
                });
            }

            function showScrollers () {
                // If not scrolled all the way left, show the left scroller
                if ( $fixedTableWrapper.scrollLeft() > 0 ) {
                    $scrollLeft.show();
                }
                else {
                    $scrollLeft.hide();
                }

                // If not scrolled all the way right, show the right scroller
                if ( $fixedTableWrapper.scrollLeft() + $fixedTableWrapper.width() < $this.width() ) {
                    $scrollRight.show();
                }
                else {
                    $scrollRight.hide();
                }
            }
        });
    };
})( jQuery );