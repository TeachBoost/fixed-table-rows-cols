/**
 * A jQuery plugin to convert a well formatted table into a table with fixed
 * rows and columns.
 *
 * Forked from http://meetselva.github.io/
 * No support for colspan
 */
(function ( $, _) {
    $.fn.fixedTableRowsCols = function ( options ) {
        var config = {
            height: 500,
            width: 2000,
            fixedCols: 1,
            fixedTHead: true,
            addScrollers: false,
            tableTemplate: function ( className ) {
                return '<table class="' + className + '" />';
            }
        };

        $.extend( config, options );

        //  For each table found
        return this.each( function () {
            var $table = $( this );
            var $fixedRows;
            var $fixedCols;
            var $scrollLeft;
            var $scrollRight;
            var $fixedRowCols;
            var scrollStep = 0;
            var tableHeight = 0;
            var fixedColWidth = 0;
            var $fixedTableScroller;
            var hasVerticalScrollBar;
            var $fixedTableContainer;
            var hasHorizontalScrollbar;
            var $fixedTableRelContainer;
            var tableWidth = $table.outerWidth();
            var scrollBarWidth = getScrollBarWidth();
            var thHeight = $table.find( 'tr:first-child th:first-child' ).outerHeight();
            var tdHeight = $table.find( 'tr:first-child td:first-child' ).outerHeight();

            // Set the width and height of each td & th based on the default
            // rendering of the table. Agnostic to how table and cell widths
            // are defined before this plugin is invoked, and does not take
            // in any values to set whose widths.
            $table.find( 'th' ).css({
                height: thHeight,
                width: function ( index, style ) {
                    return style;
                }
            });

            // Hard code the width of the table
            $table.width( tableWidth );
            // Calculate the width of the fixed column
            fixedColWidth = _.reduce(
                _.map(
                    $table.find(
                        'tr:first-child th:nth-child(-n + ' +
                        config.fixedCols + ')' ),
                    function ( el ) {
                        return $( el ).outerWidth();
                    }),
                function ( memo, num ) {
                    return memo + num;
                });

            // Wrap table in a container to define the scrollable area
            $table.wrap( '<div class="ft-container" />' );
            $fixedTableContainer = $table.parent();
            $fixedTableContainer.css({
                width: config.width,
                height: config.height
            });

            // Add relative container to wrap the scroller
            $table.wrap( '<div class="ft-rel-container" />' );
            $fixedTableRelContainer = $table.parent();

            // Add wrapper to base table which will have the scrollbars
            $table.wrap( '<div class="ft-scroller" />' );
            $fixedTableScroller = $table.parent();
            $fixedTableScroller.css( 'width', $fixedTableContainer.width() );

            // If the scroller has a vertical scrollbar, then resize the table
            // to be thinner by the width of the scrollbar.
            hasVerticalScrollBar = $fixedTableScroller.get( 0 ).scrollHeight
                > $fixedTableScroller.height();

            if ( hasVerticalScrollBar ) {
                tableWidth = tableWidth - scrollBarWidth;
                $table.width( tableWidth );
                $table.find( 'thead' ).width( tableWidth );
            }

            // If the scroller has a horizontal scrollbar, then resize the
            // scrolling pane to be larger by the size of the scrollbar.
            hasHorizontalScrollbar = $fixedTableScroller.get( 0 ).scrollWidth
                > ( $fixedTableScroller.width()
                    - ( hasVerticalScrollBar ? scrollBarWidth : 0 ) );

            if ( hasHorizontalScrollbar ) {
                $fixedTableScroller.height( config.height + scrollBarWidth );
            }

            // If we're fixing the THEAD, then clone the header and prepend
            // it to the top of the relative container. This sits on top of
            // the scrolling content and the .ft-rwrapper class makes it
            // absolutely positioned.
            if ( config.fixedTHead ) {
                // Fixed Rows
                $fixedRows = $( config.tableTemplate( 'ft-r table' ) )
                    .append( $table.find( 'thead' ).clone() );
                $fixedTableRelContainer.prepend( $fixedRows );
                $fixedRows.wrap( $( '<div class="ft-rwrapper" />' ) );
                $fixedRows.width( tableWidth );
            }

            // Fix any columns
            if ( config.fixedCols > 0 ) {
                // Upper Left corner, cells that lie in both the fixed row and cols
                $fixedRowCols = $( config.tableTemplate( 'ft-rc table' ) )
                    .append( $table.find( 'thead' ).clone() );
                // Remove all THs but the first one
                $fixedRowCols
                    .find( 'th:nth-child( n + ' + ( config.fixedCols + 1 ) + ' )' )
                    .remove();
                // Add fixed row + col section
                $fixedTableRelContainer.prepend( $fixedRowCols );
                // Clone the fixed row column and append TBODY for the remaining rows
                $fixedCols = $fixedRowCols.clone();
                $fixedCols[ 0 ].className = 'table ft-c';
                $fixedCols.append( $table.find( 'tbody' ).clone() );
                $fixedCols
                    .find( 'td:nth-child( n + ' + ( config.fixedCols + 1 ) + ' )' )
                    .remove();
                // Append the fixed columns. This class makes them absolutely
                // positioned.
                $fixedRowCols.after( $fixedCols );
                $fixedCols.wrap( $( '<div class="ft-cwrapper" />' ) );
                // Set the width of the Fixed Columns and Fixed Row-Columns
                $fixedCols.add( $fixedRowCols ).width( fixedColWidth );
                $fixedCols.height( $table.outerHeight( true ) );
                // Set the width and height of the wrapper
                $fixedCols.parent()
                    .css({
                        height: $fixedTableContainer.height()
                    })
                    .width( $fixedRowCols.outerWidth( true ) + 1 );

                // Add scroll indicators
                if ( config.addScrollers ) {
                    $scrollLeft = $( '<div class="ft-scroll-left" />' );
                    $scrollLeft.append( '<i class="fa fa-chevron-left" />' );
                    $scrollRight = $( '<div class="ft-scroll-right" />' );
                    $scrollRight.append( '<i class="fa fa-chevron-right" />' );
                    $scrollLeft.css({ left: $fixedRowCols.outerWidth( true ) });
                    $fixedTableRelContainer.append( $scrollLeft );
                    $fixedTableRelContainer.append( $scrollRight );
                }
            }

            $fixedRows.parent()
                .css({
                    width: $fixedTableScroller.width()
                });

            // On table scroll we need to
            $fixedTableScroller.scroll( function () {
                var $this = $( this );

                if ( config.fixedCols > 0 ) {
                    // animate() is faster than css()
                    $fixedCols.animate({ top: $this.scrollTop() * -1 }, 0 );
                }

                $fixedRows.animate({ left: $this.scrollLeft() * -1 }, 0 );
            });

            if ( config.addScrollers && config.fixedCols > 0 ) {
                scrollStep = $fixedTableScroller.width() - fixedColWidth * 0.5;
                // $fixedTableRowsCols.add( $scrollLeft ).add( $scrollRight ).on( 'mouseover', function () {
                $table.add( $scrollLeft ).add( $scrollRight ).on( 'mouseover', function () {
                    showScrollers();
                });

                $fixedCols.add( $fixedRows ).on( 'mouseover', function () {
                    $scrollLeft.fadeOut( 'fast' );
                    $scrollRight.fadeOut( 'fast' );
                });

                $scrollLeft.on( 'click', function () {
                    $fixedTableScroller.animate({
                        scrollLeft: Math.max( 0, $fixedTableScroller.scrollLeft() - scrollStep )
                    }, 500, showScrollers() );
                });

                $scrollRight.on( 'click', function () {
                    $fixedTableScroller.animate({
                        scrollLeft: Math.min(
                            $table.width() - $fixedTableScroller.width(),
                            $fixedTableScroller.scrollLeft() + scrollStep )
                    }, 500, showScrollers() );
                });
            }

            function showScrollers () {
                // If not scrolled all the way left, show the left scroller
                if ( $fixedTableScroller.scrollLeft() > 0 ) {
                    $scrollLeft.show();
                }
                else {
                    $scrollLeft.hide();
                }

                // If not scrolled all the way right, show the right scroller
                if ( $fixedTableScroller.scrollLeft() + $fixedTableScroller.width() < $table.width() ) {
                    $scrollRight.show();
                }
                else {
                    $scrollRight.hide();
                }
            }

            function getScrollBarWidth () {
                var w1;
                var w2;
                var inner = document.createElement( 'p' );
                var outer = document.createElement( 'div' );

                inner.style.width = "100%";
                inner.style.height = "200px";
                outer.style.position = "absolute";
                outer.style.top = "0px";
                outer.style.left = "0px";
                outer.style.width = "200px";
                outer.style.height = "150px";
                outer.style.overflow = "hidden";
                outer.style.visibility = "hidden";
                outer.appendChild( inner );

                document.body.appendChild( outer );
                w1 = inner.offsetWidth;
                outer.style.overflow = 'scroll';
                w2 = inner.offsetWidth;

                if ( w1 == w2 ) {
                    w2 = outer.clientWidth;
                }

                document.body.removeChild( outer );

                return (w1 - w2);
            };
        });
    };
})( jQuery, _ );
