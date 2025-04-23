global HONK_VK_SIZE: u32 = 128;
global HONK_PROOF_SIZE: u32 = 456;
global HONK_IDENTIFIER: u32 = 1;

fn main(
    verification_key: [Field; HONK_VK_SIZE],
    proof_a: [Field; HONK_PROOF_SIZE],
    public_inputs_a: pub [Field; 1],
    proof_b: [Field; HONK_PROOF_SIZE],
    public_inputs_b: pub [Field; 1],
) {
    std::verify_proof_with_type(
        verification_key,
        proof_a,
        public_inputs_a,
        0x0,
        HONK_IDENTIFIER,
    );
    std::verify_proof_with_type(
        verification_key,
        proof_b,
        public_inputs_b,
        0x0,
        HONK_IDENTIFIER,
    );
}
