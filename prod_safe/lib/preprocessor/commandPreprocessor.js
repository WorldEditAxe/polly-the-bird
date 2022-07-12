export class CommandPreprocessor {
    constructor(options) {
        this.cooldown = options.cooldown ? options.cooldown.getTotalSeconds() : 0;
        this.requiredPermissions = options.requiredPermissions || undefined;
        this.serverOnly = options.serverOnly || false;
        this.saveCooldownInDb = options.saveCooldownInDb || false;
    }
}
//# sourceMappingURL=commandPreprocessor.js.map