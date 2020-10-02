var {declare} = require('@babel/helper-plugin-utils');
var {types: t} = require('@babel/core');
var pathMod = require('path');

module.exports = declare(api => {
    var styled = [];

    return {
        name: 'custom',
        visitor: {
            VariableDeclarator(path, state) {
                var isStyled = t.isTaggedTemplateExpression(path.node.init);
                if (!isStyled) return;
                setDisplayName(path.parentPath, path.node.id, path.node.id.name, dir.after);

                var file = state.file;
                var blockName = pathMod.basename(file.opts.filename, pathMod.extname(file.opts.filename));

                if (path.node.id.name !== blockName) {
                    styled.push({
                        name: path.node.id.name,
                        nodeId: path.node.id,
                        target: path.parentPath,
                    });
                }
            },
            JSXElement(path) {
                var index = styled.findIndex((item) => path.node.openingElement.name.name === item.name);
                if (index === -1) return;

                var currentStyled = styled.splice(index,1);
                currentStyled = currentStyled[0];

                var parent = path.findParent(path => path.isFunctionDeclaration());
                var displayName = parent.node.id.name + '.' + currentStyled.name;

                setDisplayName(parent, currentStyled.nodeId, displayName, dir.before);
            }
        },
    };
});

var dir = {
    after: 'after',
    before: 'before'
};

function setDisplayName(target, nameNodeId, displayName, direction) {
    var setDisplayNameStmn = t.expressionStatement(t.assignmentExpression(
        '=',
        t.memberExpression(nameNodeId, t.identifier('displayName')),
        t.stringLiteral(displayName)
    ));

    switch (direction) {
        case dir.after: {
            return target.insertAfter(setDisplayNameStmn);
        }
        case dir.before: {
            return target.insertBefore(setDisplayNameStmn);
        }
        default: {return;}
    }
}