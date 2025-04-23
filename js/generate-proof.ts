import { Barretenberg, RawBuffer, UltraHonkBackend } from "@aztec/bb.js";
import innerCircuit from "../circuits/inner/target/inner.json" assert { type: "json" };
import recursiveCircuit from "../circuits/recursive/target/recursive.json" assert { type: "json" };
import { CompiledCircuit, Noir } from "@noir-lang/noir_js";

(async () => {
  try {
    const innerCircuitNoir = new Noir(innerCircuit as CompiledCircuit);
    const innerBackend = new UltraHonkBackend(innerCircuit.bytecode, { threads: 2 }, { recursive: true });

    // Generate proof for inner circuit a
    const inputs = { x: 3, y: 5 }
    const { witness: witness_a } = await innerCircuitNoir.execute(inputs);
    const { proof: innerProofFields_a, publicInputs: innerPublicInputs_a } = await innerBackend.generateProofForRecursiveAggregation(witness_a);

    // Generate proof for inner circuit b
    const inputs_b = { x: 3, y: 7 }
    const { witness: witness_b } = await innerCircuitNoir.execute(inputs_b);
    const { proof: innerProofFields_b, publicInputs: innerPublicInputs_b } = await innerBackend.generateProofForRecursiveAggregation(witness_b);

    // Get verification key for inner circuit as fields
    const innerCircuitVerificationKey = await innerBackend.getVerificationKey();
    const barretenbergAPI = await Barretenberg.new({ threads: 2 });
    const vkAsFields = (await barretenbergAPI.acirVkAsFieldsUltraHonk(new RawBuffer(innerCircuitVerificationKey))).map(field => field.toString());

    // Generate proof of the recursive circuit
    const recursiveCircuitNoir = new Noir(recursiveCircuit as CompiledCircuit);
    const recursiveBackend = new UltraHonkBackend(recursiveCircuit.bytecode, { threads: 2 }, { recursive: true });

    const recursiveInputs = { proof_a: innerProofFields_a, public_inputs_a: innerPublicInputs_a, proof_b: innerProofFields_b, public_inputs_b: innerPublicInputs_b, verification_key: vkAsFields };
    const { witness: recursiveWitness } = await recursiveCircuitNoir.execute(recursiveInputs);
    const { proof: recursiveProof, publicInputs: recursivePublicInputs } = await recursiveBackend.generateProof(recursiveWitness);

    console.log("Public inputs: ", recursivePublicInputs);

    // Verify recursive proof
    const verified = await recursiveBackend.verifyProof({ proof: recursiveProof, publicInputs: recursivePublicInputs });
    console.log("Recursive proof verified: ", verified);

    process.exit(verified ? 0 : 1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
