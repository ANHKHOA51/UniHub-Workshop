class NotificationMethod {
    constructor() {
        if (this.constructor == NotificationMethod) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    send(message) {
        throw new Error("Method must be implemented.");
    }
}

class NotificationService {
    notificationMethods = [];

    subscribe(method) {
        this.notificationMethods.push(method);
    }

    notifyAll(message) {
        this.notificationMethods.forEach(method => method.send(message));
    }
}

export { NotificationMethod, NotificationService };