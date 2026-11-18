package com.klu.exception;

public class ServiceUnavailableException extends AppException {
    public ServiceUnavailableException(String message) {
        super(503, message);
    }
}

