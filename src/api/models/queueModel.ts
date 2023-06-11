export interface QueueModel {
    "arguments": any,
    "auto_delete": boolean,
    "backing_queue_status": {
        "avg_ack_egress_rate": number,
        "avg_ack_ingress_rate": number,
        "avg_egress_rate": number,
        "avg_ingress_rate": number,
        "delta": [
            string
        ],
        "len": number,
        "mode": string,
        "next_seq_id": number,
        "q1": number,
        "q2": number,
        "q3": number,
        "q4": number,
        "target_ram_count": number
    },
    "consumer_details": any[],
    "consumer_utilisation": any,
    "consumers": number,
    "deliveries": string[],
    "durable": boolean,
    "effective_policy_definition": any[],
    "exclusive": boolean,
    "exclusive_consumer_tag": string,
    "garbage_collection": {
        "fullsweep_after": number,
        "max_heap_size": number,
        "min_bin_vheap_size": number,
        "min_heap_size": number,
        "minor_gcs": number
    },
    "head_message_timestamp": string,
    "idle_since": string,
    "incoming": string[],
    "memory": number,
    "message_bytes": number,
    "message_bytes_paged_out": number,
    "message_bytes_persistent": number,
    "message_bytes_ram": number,
    "message_bytes_ready": number,
    "message_bytes_unacknowledged": number,
    "message_stats": {
        "ack": number,
        "ack_details": {
            "rate": number
        },
        "deliver": number,
        "deliver_details": {
            "rate": number
        },
        "deliver_get": number,
        "deliver_get_details": {
            "rate": number
        },
        "deliver_no_ack": number,
        "deliver_no_ack_details": {
            "rate": number
        },
        "get": number,
        "get_details": {
            "rate": number
        },
        "get_no_ack": number,
        "get_no_ack_details": {
            "rate": number
        },
        "publish": number,
        "publish_details": {
            "rate": number
        },
        "redeliver": number,
        "redeliver_details": {
            "rate": number
        }
    },
    "messages": number,
    "messages_details": {
        "rate": number
    },
    "messages_paged_out": number,
    "messages_persistent": number,
    "messages_ram": number,
    "messages_ready": number,
    "messages_ready_details": {
        "rate": number
    },
    "messages_ready_ram": number,
    "messages_unacknowledged": number,
    "messages_unacknowledged_details": {
        "rate": number
    },
    "messages_unacknowledged_ram": number,
    "name": string,
    "node": string,
    "operator_policy": string,
    "policy": string,
    "recoverable_slaves": string,
    "reductions": number,
    "reductions_details": {
        "rate": number
    },
    "state": string,
    "vhost": string

}

export interface QueueMessageModel {

    "exchange": string,
    "message_count": number,
    "payload": string,
    "payload_bytes": number,
    "payload_encoding": string,
    "properties": any[],
    "redelivered": boolean,
    "routing_key": string

}