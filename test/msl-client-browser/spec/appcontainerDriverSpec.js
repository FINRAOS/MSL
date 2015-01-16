describe('appcontainer-driver', function() {
    
    describe('escapeString()', function() {

        it('escapes single quotes', function() {
            var escaped = escapeString("I'm using MSL");
            expect(escaped).toEqual("I\\'m using MSL");
        });

        it('escapes double quotes', function() {
            var escaped = escapeString('MSL stands for "Mock Service Layer"');
            expect(escaped).toEqual('MSL stands for \\"Mock Service Layer\\"');
        });

        it('escapes backslashes', function() {
            var escaped = escapeString('MSL now uses \\ to escape quotes');
            expect(escaped).toEqual('MSL now uses \\\\ to escape quotes');
        });

        it('escapes backslashes and quotes', function() {
            var escaped = escapeString('MSL now uses \\ to escape quotes, "this quote should be escaped"');
            expect(escaped).toEqual('MSL now uses \\\\ to escape quotes, \\"this quote should be escaped\\"');
        });

        it('does nothing if the string does not contain quotes or backslashes', function() {
            var escaped = escapeString('MSL is cool!');
            expect(escaped).toEqual('MSL is cool!');
        });

        it('throws if given no arguments', function() {
            expect(function() {
                escapeString();
            }).toThrow();
        });

        it('throws if given null argument', function() {
            expect(function() {
                escapeString(null);
            }).toThrow();
        });

        it('throws if given defined, non-null, non-string argument', function() {
            expect(function() {
                escapeString(0);
            }).toThrow();

            expect(function() {
                escapeString(1);
            }).toThrow();

            expect(function() {
                escapeString(-1);
            }).toThrow();

            expect(function() {
                escapeString(2);
            }).toThrow();

            expect(function() {
                escapeString(true);
            }).toThrow();

            expect(function() {
                escapeString(false);
            }).toThrow();

            expect(function() {
                escapeString([]);
            }).toThrow();

            expect(function() {
                escapeString([123]);
            }).toThrow();

            expect(function() {
                escapeString({});
            }).toThrow();

            expect(function() {
                escapeString({a:123});
            }).toThrow();
        });

    });
    
});